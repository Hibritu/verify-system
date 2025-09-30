"use client"
import { useState } from "react";
import axios from "axios";

export function PdfManagement() {
  const [file, setFile] = useState(null);
  const [pdfTitle, setPdfTitle] = useState("");
  const [qr, setQr] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const handleUpload = async () => {
    if (!file) return alert("Select a PDF first");
    const token = localStorage.getItem("token");
    if (!token) return alert("Please login as admin");

    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("title", pdfTitle);

    try {
      setLoading(true);
      const res = await axios.post(
        `${API_BASE_URL}/pdf/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setQr(res.data.qrCodeData);
      setPdfUrl(res.data.pdfUrl);
      setDownloadUrl(res.data.downloadUrl);
      alert("PDF uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert("Upload failed: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    const url = downloadUrl || pdfUrl;
    if (!url) return alert("No download URL available");
  
    const token = localStorage.getItem("token");
    if (!token) return alert("Please login");

    // Preferred: avoid XHR so browser/IDM doesn't block; use direct link with token query
    try {
      const urlWithToken = `${url}${url.includes('?') ? '&' : '?'}token=${encodeURIComponent(token.replace('Bearer ', ''))}`;
      const link = document.createElement('a');
      link.href = urlWithToken;
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    } catch (_) {
      // Fallback to XHR blob if navigation approach fails
    }
  
    try {
      const res = await axios.get(url, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
        // Let us inspect non-2xx responses instead of throwing generic Network Error
        validateStatus: () => true,
      });

      // Surface server-side errors with readable message
      if (res.status !== 200) {
        let serverMsg = "";
        try {
          serverMsg = await new Response(res.data).text();
        } catch (_) {}
        throw new Error(serverMsg || `HTTP ${res.status}`);
      }

      // Try to extract filename from Content-Disposition header
      const contentDisposition = res.headers["content-disposition"];
      let filename = `${pdfTitle || "download"}.pdf`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename\*=UTF-8''(.+)|filename="?(.+)"?/);
        if (match) {
          filename = decodeURIComponent(match[1] || match[2]);
        }
      }

      const blob = new Blob([res.data], { type: "application/pdf" });
      const urlBlob = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = urlBlob;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();

      // cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(urlBlob);
    } catch (err) {
      console.error("Download error:", err);
      alert("Download failed: " + (err.response?.data?.error || err.message));
    }
  };

  // Download the displayed QR image as a PNG file
  const handleDownloadQr = () => {
    if (!qr) return alert("No QR to download");
    const link = document.createElement('a');
    link.href = qr; // data:image/png;base64,...
    link.download = `${pdfTitle || 'qr-code'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">PDF Management</h2>
      <input
        type="text"
        placeholder="Enter PDF title"
        value={pdfTitle}
        onChange={(e) => setPdfTitle(e.target.value)}
        className="border p-2 mb-2 w-full"
      />
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-2"
      />
      <button
        onClick={handleUpload}
        className="bg-green-500 text-white px-4 py-2 rounded mb-4"
        disabled={loading}
      >
        {loading ? "Uploading..." : "Upload PDF"}
      </button>

      {qr && (
        <div className="mt-4">
          <h3 className="font-semibold mb-1">QR Code:</h3>
          <img src={qr} alt="QR Code" />
          <button
            onClick={handleDownloadQr}
            className="mt-2 bg-gray-700 text-white px-3 py-1 rounded"
          >
            Download QR Code
          </button>
        </div>
      )}
      
    </div>
  );
}
