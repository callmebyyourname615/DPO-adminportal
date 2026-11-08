import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DocumentChart, InquiryChart } from "@/components/admin/DashboardCharts";

describe("dashboard chart data", () => {
  it("shows document categories and counts from the API", () => {
    render(<DocumentChart data={[{category:"fsnp",count:3},{category:"decree",count:8}]} />);
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("FSNP")).toBeInTheDocument();
  });
  it("shows new inquiries and the remainder without inventing other statuses", () => {
    render(<InquiryChart total={7} unread={2} />);
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
  });
});
