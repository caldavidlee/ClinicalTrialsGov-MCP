import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// create the MCP server
const server = new McpServer({
    name: "Clinical Trials MCP Server",
    version: "1.0.0",
});

const BASE_URL = "https://clinicaltrials.gov/api/v2";



//
// TOOL 1: list_studies
// Mirrors your "List Studies" concept with:
// query.cond, query.term, query.locn, filter.overallStatus, pageSize, format, fields, countTotal, pageToken
//
server.tool(
    "list_studies",
    {
      cond: z.string().describe("Maps to query.cond. Main condition, e.g. 'breast cancer'."),
      term: z
        .string()
        .optional()
        .describe("Maps to query.term. Extra free-text terms, e.g. 'HER2-positive'."),
      locn: z
        .string()
        .optional()
        .describe(
          "Maps to query.locn. Location text, e.g. 'San Francisco California United States'."
        ),
      overallStatus: z
        .string()
        .optional()
        .describe(
          "Maps to filter.overallStatus, e.g. 'RECRUITING,NOT_YET_RECRUITING'."
        ),
      pageSize: z
        .number()
        .optional()
        .default(20)
        .describe("Maps to pageSize."),
      format: z
        .string()
        .optional()
        .default("json")
        .describe("Maps to format. Usually 'json'."),
      fields: z
        .string()
        .optional()
        .describe("Comma-separated list of fields to return."),
      countTotal: z
        .string()
        .optional()
        .default("true")
        .describe("Maps to countTotal. Usually 'true'."),
      pageToken: z
        .string()
        .optional()
        .describe("Pagination token from previous response, if any."),
    },
    async ({
      cond,
      term,
      locn,
      overallStatus,
      pageSize = 20,
      format = "json",
      fields,
      countTotal = "true",
      pageToken,
    }) => {
      const url = new URL(`${BASE_URL}/studies`);
  
      // Required
      url.searchParams.set("query.cond", cond);
  
      // Optional
      if (term) url.searchParams.set("query.term", term);
      if (locn) url.searchParams.set("query.locn", locn);
      if (overallStatus) url.searchParams.set("filter.overallStatus", overallStatus);
      if (fields) url.searchParams.set("fields", fields);
      if (pageToken) url.searchParams.set("pageToken", pageToken);
  
      // Always set
      url.searchParams.set("pageSize", String(pageSize));
      url.searchParams.set("format", format);
      url.searchParams.set("countTotal", countTotal);
  
      const res = await fetch(url.toString());
  
      if (!res.ok) {
        const text = await res.text();
        return {
          content: [
            {
              type: "text",
              text: `ClinicalTrials.gov error: ${res.status} ${res.statusText}\n${text}`,
            },
          ],
        };
      }
  
      const data = await res.json();
  
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    }
  );
  
  // TOOL 2: get_study
// Mirrors "Get A Study": GET /studies/{nctId}
//
server.tool(
    "get_study",
    {
      nct_id: z
        .string()
        .describe("NCT ID of the study, e.g. 'NCT04267848'."),
    },
    async ({ nct_id }) => {
      const url = `${BASE_URL}/studies/${encodeURIComponent(nct_id)}`;
  
      const res = await fetch(url);
  
      if (!res.ok) {
        const text = await res.text();
        return {
          content: [
            {
              type: "text",
              text: `ClinicalTrials.gov error: ${res.status} ${res.statusText}\n${text}`,
            },
          ],
        };
      }
  
      const data = await res.json();
  
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    }
  );
  
  //
  // TOOL 3: specific_fields_in_study
  // Mirrors "Specific Fields in Study": same endpoint, but requires `fields`.
  //
  server.tool(
    "specific_fields_in_study",
    {
      cond: z
        .string()
        .describe("Maps to query.cond. Main condition."),
      fields: z
        .string()
        .describe("Required. Comma-separated fields to return."),
      term: z.string().optional().describe("Maps to query.term."),
      locn: z.string().optional().describe("Maps to query.locn."),
      overallStatus: z
        .string()
        .optional()
        .describe("Maps to filter.overallStatus."),
      pageSize: z.number().optional().default(20),
      format: z.string().optional().default("json"),
      countTotal: z.string().optional().default("true"),
      pageToken: z.string().optional(),
    },
    async ({
      cond,
      fields,
      term,
      locn,
      overallStatus,
      pageSize = 20,
      format = "json",
      countTotal = "true",
      pageToken,
    }) => {
      const url = new URL(`${BASE_URL}/studies`);
  
      url.searchParams.set("query.cond", cond);
      url.searchParams.set("fields", fields);
  
      if (term) url.searchParams.set("query.term", term);
      if (locn) url.searchParams.set("query.locn", locn);
      if (overallStatus) url.searchParams.set("filter.overallStatus", overallStatus);
      if (pageToken) url.searchParams.set("pageToken", pageToken);
  
      url.searchParams.set("pageSize", String(pageSize));
      url.searchParams.set("format", format);
      url.searchParams.set("countTotal", countTotal);
  
      const res = await fetch(url.toString());
  
      if (!res.ok) {
        const text = await res.text();
        return {
          content: [
            {
              type: "text",
              text: `ClinicalTrials.gov error: ${res.status} ${res.statusText}\n${text}`,
            },
          ],
        };
      }
  
      const data = await res.json();
  
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    }
  );
  
  // 5. Start the MCP server over stdio (like the calendar example)
async function init() {
const transport = new StdioServerTransport();
await server.connect(transport);
}
  
init();