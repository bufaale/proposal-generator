import { Check, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type CellValue = true | false | string;

interface ComparisonRow {
  feature: string;
  proposalforge: CellValue;
  proposify: CellValue;
  pandadoc: CellValue;
  betterproposals: CellValue;
}

const comparisonData: ComparisonRow[] = [
  {
    feature: "Starting Price",
    proposalforge: "$19/mo",
    proposify: "$19/user/mo",
    pandadoc: "$19/user/mo",
    betterproposals: "$19/user/mo",
  },
  {
    feature: "AI Proposal Generation",
    proposalforge: true,
    proposify: false,
    pandadoc: false,
    betterproposals: false,
  },
  {
    feature: "Price for 5 Users",
    proposalforge: "$19/mo",
    proposify: "$95-325/mo",
    pandadoc: "$95-325/mo",
    betterproposals: "$95-145/mo",
  },
  {
    feature: "Free Tier",
    proposalforge: true,
    proposify: false,
    pandadoc: "E-sign only",
    betterproposals: false,
  },
  {
    feature: "PDF Export",
    proposalforge: true,
    proposify: true,
    pandadoc: true,
    betterproposals: true,
  },
  {
    feature: "Client Portal",
    proposalforge: true,
    proposify: true,
    pandadoc: true,
    betterproposals: true,
  },
  {
    feature: "Engagement Tracking",
    proposalforge: true,
    proposify: true,
    pandadoc: true,
    betterproposals: true,
  },
];

function CellContent({ value }: { value: CellValue }) {
  if (value === true) {
    return <Check className="mx-auto h-5 w-5 text-green-600" />;
  }
  if (value === false) {
    return <X className="mx-auto h-5 w-5 text-red-400" />;
  }
  return (
    <span className="text-sm text-muted-foreground">{value}</span>
  );
}

export function Comparison() {
  return (
    <section id="comparison" className="bg-muted/40 py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold">How we compare</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            AI-generated proposals at a flat price — no per-user fees.
          </p>
        </div>
        <div className="mt-12 overflow-x-auto rounded-lg border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Feature</TableHead>
                <TableHead className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-bold text-primary">ProposalForge</span>
                    <Badge variant="secondary" className="text-xs">
                      You are here
                    </Badge>
                  </div>
                </TableHead>
                <TableHead className="text-center">Proposify</TableHead>
                <TableHead className="text-center">PandaDoc</TableHead>
                <TableHead className="text-center">Better Proposals</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparisonData.map((row) => (
                <TableRow key={row.feature}>
                  <TableCell className="font-medium">{row.feature}</TableCell>
                  <TableCell className="bg-primary/5 text-center">
                    <CellContent value={row.proposalforge} />
                  </TableCell>
                  <TableCell className="text-center">
                    <CellContent value={row.proposify} />
                  </TableCell>
                  <TableCell className="text-center">
                    <CellContent value={row.pandadoc} />
                  </TableCell>
                  <TableCell className="text-center">
                    <CellContent value={row.betterproposals} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
