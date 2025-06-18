import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

function ExportChat({ messages, user, onExport }) {
  const { toast } = useToast();

  const exportAsPDF = () => {
    if (messages.length === 0) {
      toast({
        title: "No messages to export",
        description: "Start a conversation first to export the chat.",
        variant: "destructive",
      });
      return;
    }

    try {
      const doc = new jsPDF();
      const timestamp = new Date().toISOString().split("T")[0];

      // Header
      doc.setFillColor(239, 68, 68); // Red color
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.text("ZeroCode Chat Export", 20, 25);

      doc.setFontSize(12);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 35);

      let currentY = 55;
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = doc.internal.pageSize.getWidth() - margin * 2;

      // User info
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.text("Chat Information", margin, currentY);
      currentY += 15;

      doc.setFontSize(10);
      doc.text(
        `User: ${user?.name || "User"} (${user?.email || "N/A"})`,
        margin,
        currentY,
      );
      currentY += 10;
      doc.text(`Total Messages: ${messages.length}`, margin, currentY);
      currentY += 20;

      // Messages
      messages.forEach((message, index) => {
        if (currentY > pageHeight - 60) {
          doc.addPage();
          currentY = margin;
        }

        const sender = message.sender === "user" ? "You" : "AI Assistant";
        let timestamp;
        try {
          if (
            (message.timestamp && typeof message.timestamp !== "object") ||
            message.timestamp instanceof Date
          ) {
            const date = new Date(message.timestamp);
            timestamp = isNaN(date.getTime())
              ? new Date().toLocaleString()
              : date.toLocaleString();
          } else {
            timestamp = new Date().toLocaleString();
          }
        } catch {
          timestamp = new Date().toLocaleString();
        }

        doc.setFontSize(12);
        doc.setFont(undefined, "bold");
        doc.text(`${sender} (${timestamp})`, margin, currentY);
        currentY += 10;

        doc.setFont(undefined, "normal");
        const lines = doc.splitTextToSize(message.text, maxWidth);
        lines.forEach((line) => {
          if (currentY > pageHeight - 40) {
            doc.addPage();
            currentY = margin;
          }
          doc.text(line, margin, currentY);
          currentY += 7;
        });

        currentY += 10;
      });

      doc.save(`zerocode-chat-${timestamp}.pdf`);

      toast({
        title: "Chat exported successfully!",
        description: "PDF file has been downloaded to your device.",
        variant: "default",
      });

      onExport("pdf");
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: "Export failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant="ghost"
      className="justify-start w-full"
      onClick={exportAsPDF}
    >
      <Download className="w-4 h-4 mr-2" />
      Export as PDF
    </Button>
  );
}

export default ExportChat;
