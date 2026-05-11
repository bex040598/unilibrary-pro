import { NextRequest } from "next/server";

import { createSeedData } from "@/data/seed";
import { buildDublinCoreXml } from "@/lib/ai/citationAssistant";

const data = createSeedData();

function xml(body: string) {
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n${body}`, {
    headers: {
      "Content-Type": "text/xml; charset=utf-8"
    }
  });
}

function wrapOai(verb: string, content: string) {
  return xml(`
<OAI-PMH xmlns="http://www.openarchives.org/OAI/2.0/">
  <responseDate>${new Date().toISOString()}</responseDate>
  <request verb="${verb}">https://unilibrary-platformasi-bex040598.onrender.com/api/oai</request>
  ${content}
</OAI-PMH>`);
}

function identifierFor(recordId: string) {
  return `oai:unilibrary.uz:${recordId}`;
}

export function GET(request: NextRequest) {
  const verb = request.nextUrl.searchParams.get("verb") ?? "Identify";
  const identifier = request.nextUrl.searchParams.get("identifier");

  if (verb === "Identify") {
    return wrapOai(
      verb,
      `<Identify>
        <repositoryName>UniLibrary Pro Repository</repositoryName>
        <baseURL>https://unilibrary-platformasi-bex040598.onrender.com/api/oai</baseURL>
        <protocolVersion>2.0</protocolVersion>
        <adminEmail>library@unilibrary.uz</adminEmail>
        <earliestDatestamp>${data.records[0]?.createdAt ?? new Date().toISOString()}</earliestDatestamp>
        <deletedRecord>no</deletedRecord>
        <granularity>YYYY-MM-DDThh:mm:ssZ</granularity>
      </Identify>`
    );
  }

  if (verb === "ListMetadataFormats") {
    return wrapOai(
      verb,
      `<ListMetadataFormats>
        <metadataFormat>
          <metadataPrefix>oai_dc</metadataPrefix>
          <schema>http://www.openarchives.org/OAI/2.0/oai_dc.xsd</schema>
          <metadataNamespace>http://www.openarchives.org/OAI/2.0/oai_dc/</metadataNamespace>
        </metadataFormat>
        <metadataFormat>
          <metadataPrefix>marc21</metadataPrefix>
          <schema>http://www.loc.gov/standards/marcxml/schema/MARC21slim.xsd</schema>
          <metadataNamespace>http://www.loc.gov/MARC21/slim</metadataNamespace>
        </metadataFormat>
      </ListMetadataFormats>`
    );
  }

  if (verb === "ListSets") {
    const sets = Array.from(new Set(data.records.map((record) => record.faculty))).slice(0, 8);
    return wrapOai(
      verb,
      `<ListSets>
        ${sets
          .map(
            (setName) => `
        <set>
          <setSpec>${setName.toLowerCase().replace(/\s+/g, "-")}</setSpec>
          <setName>${setName}</setName>
        </set>`
          )
          .join("")}
      </ListSets>`
    );
  }

  if (verb === "ListIdentifiers") {
    return wrapOai(
      verb,
      `<ListIdentifiers>
        ${data.records
          .slice(0, 20)
          .map(
            (record) => `
        <header>
          <identifier>${identifierFor(record.id)}</identifier>
          <datestamp>${record.updatedAt}</datestamp>
          <setSpec>${record.faculty.toLowerCase().replace(/\s+/g, "-")}</setSpec>
        </header>`
          )
          .join("")}
      </ListIdentifiers>`
    );
  }

  if (verb === "ListRecords") {
    return wrapOai(
      verb,
      `<ListRecords>
        ${data.records
          .slice(0, 12)
          .map(
            (record) => `
        <record>
          <header>
            <identifier>${identifierFor(record.id)}</identifier>
            <datestamp>${record.updatedAt}</datestamp>
            <setSpec>${record.faculty.toLowerCase().replace(/\s+/g, "-")}</setSpec>
          </header>
          <metadata>
${buildDublinCoreXml(record)}
          </metadata>
        </record>`
          )
          .join("")}
      </ListRecords>`
    );
  }

  if (verb === "GetRecord") {
    const record = data.records.find((item) => identifier === identifierFor(item.id) || item.id === identifier);
    if (!record) {
      return wrapOai(
        verb,
        `<error code="idDoesNotExist">The requested identifier was not found in UniLibrary Pro mock repository.</error>`
      );
    }

    return wrapOai(
      verb,
      `<GetRecord>
        <record>
          <header>
            <identifier>${identifierFor(record.id)}</identifier>
            <datestamp>${record.updatedAt}</datestamp>
            <setSpec>${record.faculty.toLowerCase().replace(/\s+/g, "-")}</setSpec>
          </header>
          <metadata>
${buildDublinCoreXml(record)}
          </metadata>
        </record>
      </GetRecord>`
    );
  }

  return wrapOai(verb, `<error code="badVerb">Unsupported OAI-PMH verb: ${verb}</error>`);
}
