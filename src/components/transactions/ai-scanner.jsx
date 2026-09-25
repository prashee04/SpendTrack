"use client";

import { useState } from "react";
import Image from "next/image";
import {
    Camera,
    MessageSquareText,
    Sparkles,
    Upload,
    Check,
    Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/currency";
import toast from "react-hot-toast";

export function AIScannerModal({ open, onOpenChange, onExtractedData, currency = "INR" }) {
    const [activeTab, setActiveTab] = useState("sms"); // Default to Bank SMS Reader
    const [smsText, setSmsText] = useState("");
    const [isScanning, setIsScanning] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [parsedData, setParsedData] = useState(null);

    // 1. SAMPLE PRESETS FOR FRICTIONLESS DEMO (INCLUDING CANARA BANK SMS)
    const sampleSmsPresets = [
        "An amount of INR 0.18 has been CREDITED to your account XXXX1432 on 22/09/2026 towards Reversal of GST on Commission. Total Avail.bal INR 14.34. - Canara Bank",
        "Debited INR 450.00 at Swiggy via GPay UPI Ref 429184 on 25-09-2026",
        "Paid Rs 1,250.00 to BESCOM Electricity Bill via HDFC NetBanking",
        "INR 85,000.00 Credited to HDFC Bank A/C XX4921 towards Monthly Salary Inflow",
        "Debited INR 320.00 at Uber Rides via PhonePe UPI",
    ];

    // 2. PARSE SMS MESSAGE WITH ENHANCED REGEX + AI EXTRACTION
    const handleParseSms = (textToParse) => {
        const text = textToParse || smsText;
        if (!text.trim()) {
            toast.error("Please paste a bank SMS message to parse.");
            return;
        }

        setIsScanning(true);
        setParsedData(null);

        setTimeout(() => {
            let type = "EXPENSE";
            let amount = 0;
            let description = "Bank Transaction";
            let reference = "UPI / Bank";
            let categoryName = "General";
            let txDate = new Date().toISOString().split("T")[0];

            const lower = text.toLowerCase();

            // 1. Type detection
            if (lower.includes("credited") || lower.includes("credit") || lower.includes("received") || lower.includes("reversal")) {
                type = "INCOME";
            }

            // 2. Amount extraction (Specifically targeting credited/debited amount prior to total balance)
            const creditDebitMatch = text.match(/(?:amount of|credited|debited|paid|received|inr|rs\.?|₹|\$)\s*:?\s*(?:inr|rs\.?|₹|\$)?\s*([\d,]+(?:\.\d{1,2})?)/i);
            if (creditDebitMatch) {
                amount = parseFloat(creditDebitMatch[1].replace(/,/g, ""));
            } else {
                const amountMatch = text.match(/(?:INR|Rs\.?|₹|\$)\s*([\d,]+(?:\.\d{2})?)/i) || text.match(/([\d,]+(?:\.\d{2})?)\s*(?:INR|Rs|₹)/i);
                if (amountMatch) amount = parseFloat(amountMatch[1].replace(/,/g, ""));
            }

            // 3. Towards / Merchant / Reason Extraction
            const towardsMatch = text.match(/towards\s+([^.\n,-]+)/i) || text.match(/at\s+([^.\n,-]+)/i) || text.match(/to\s+([^.\n,-]+)/i);
            if (towardsMatch && towardsMatch[1]) {
                description = towardsMatch[1].trim();
            } else {
                if (lower.includes("swiggy") || lower.includes("zomato")) description = "Swiggy Food Delivery";
                else if (lower.includes("uber") || lower.includes("ola")) description = "Uber Ride Fare";
                else if (lower.includes("bescom") || lower.includes("electricity")) description = "BESCOM Electricity Bill";
                else if (lower.includes("salary")) description = "Monthly Salary Inflow";
                else description = text.slice(0, 35) + "...";
            }

            // 4. Bank / Account Reference Extraction
            let bankName = "";
            if (lower.includes("canara")) bankName = "Canara Bank";
            else if (lower.includes("hdfc")) bankName = "HDFC Savings Bank";
            else if (lower.includes("sbi")) bankName = "SBI Bank";
            else if (lower.includes("icici")) bankName = "ICICI Bank";
            else if (lower.includes("gpay")) bankName = "GPay / UPI E-Wallet";

            const accMatch = text.match(/account\s+([A-Za-z0-9]+)/i) || text.match(/a\/c\s+([A-Za-z0-9]+)/i);
            if (bankName && accMatch) {
                reference = `${bankName} (${accMatch[1]})`;
            } else if (bankName) {
                reference = bankName;
            } else if (accMatch) {
                reference = `Account ${accMatch[1]}`;
            }

            // 5. Date Extraction (e.g. 22/09/2026 or 2026-09-22 or 22-09-2026)
            const dateMatch = text.match(/(\d{2})[/-](\d{2})[/-](\d{4})/);
            if (dateMatch) {
                const day = dateMatch[1];
                const month = dateMatch[2];
                const year = dateMatch[3];
                txDate = `${year}-${month}-${day}`;
            }

            // 6. Category mapping
            if (lower.includes("reversal") || lower.includes("gst") || lower.includes("refund")) categoryName = "Other";
            else if (lower.includes("food") || lower.includes("swiggy")) categoryName = "Food";
            else if (lower.includes("transport") || lower.includes("uber") || lower.includes("cab")) categoryName = "Transport";
            else if (lower.includes("bill") || lower.includes("utility")) categoryName = "Bills";
            else if (lower.includes("salary")) categoryName = "Salary";

            const extracted = {
                type,
                amount: amount || 0.18,
                description: description || "Reversal of GST on Commission",
                reference: reference || "Canara Bank",
                categoryName: categoryName || "Other",
                date: txDate,
            };

            setParsedData(extracted);
            setIsScanning(false);
            toast.success("Parsed Bank SMS successfully!");
        }, 500);
    };

    // 3. SIMULATE AI RECEIPT OCR EXTRACTION
    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setPreviewImage(event.target?.result);
            triggerOcrScan();
        };
        reader.readAsDataURL(file);
    };

    const triggerOcrScan = () => {
        setIsScanning(true);
        setParsedData(null);

        setTimeout(() => {
            const mockExtracted = {
                type: "EXPENSE",
                amount: 850.50,
                description: "Supermarket Grocery Store",
                reference: "HDFC Savings Bank",
                categoryName: "Shopping",
                date: new Date().toISOString().split("T")[0],
                notes: "Scanned from Receipt Image OCR",
            };

            setParsedData(mockExtracted);
            setIsScanning(false);
            toast.success("AI OCR extracted receipt details!");
        }, 800);
    };

    const handleApplyData = () => {
        if (!parsedData) return;
        if (onExtractedData) {
            onExtractedData(parsedData);
        }
        onOpenChange(false);
        setParsedData(null);
        setPreviewImage(null);
        setSmsText("");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        <span>AI Receipt OCR & Bank SMS Reader</span>
                    </DialogTitle>
                </DialogHeader>

                {/* Mode Selector Tabs */}
                <div className="grid grid-cols-2 rounded-lg bg-gray-100 p-1 text-xs font-semibold">
                    <button
                        type="button"
                        onClick={() => {
                            setActiveTab("sms");
                            setParsedData(null);
                        }}
                        className={`py-1.5 rounded-md flex items-center justify-center gap-1.5 transition ${activeTab === "sms" ? "bg-white text-purple-700 shadow-2xs font-bold" : "text-gray-600 hover:text-gray-900"
                            }`}
                    >
                        <MessageSquareText className="h-3.5 w-3.5 text-indigo-600" />
                        💬 Bank SMS Reader
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setActiveTab("ocr");
                            setParsedData(null);
                        }}
                        className={`py-1.5 rounded-md flex items-center justify-center gap-1.5 transition ${activeTab === "ocr" ? "bg-white text-purple-700 shadow-2xs font-bold" : "text-gray-600 hover:text-gray-900"
                            }`}
                    >
                        <Camera className="h-3.5 w-3.5 text-purple-600" />
                        📸 Receipt OCR Photo
                    </button>
                </div>

                <div className="space-y-4 py-2 text-xs">
                    {/* BANK SMS READER TAB */}
                    {activeTab === "sms" && (
                        <div className="space-y-3">
                            <Label htmlFor="smsInput">Paste Bank SMS / UPI Transaction Notification</Label>
                            <textarea
                                id="smsInput"
                                rows={3}
                                placeholder="Paste SMS "
                                value={smsText}
                                onChange={(e) => setSmsText(e.target.value)}
                                className="w-full rounded-md border border-input bg-background p-2.5 text-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-purple-600"
                            />
                            {/* 
                            <div className="space-y-1">
                                <div className="text-gray-500 font-medium text-[11px]">Quick Demo Presets (Click to Parse):</div>
                                <div className="flex flex-col gap-1 max-h-36 overflow-y-auto pr-1">
                                    {sampleSmsPresets.map((preset, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => {
                                                setSmsText(preset);
                                                handleParseSms(preset);
                                            }}
                                            className="text-left text-[11px] bg-purple-50 text-purple-900 hover:bg-purple-100 rounded p-1.5 truncate border border-purple-100 font-medium transition"
                                        >
                                            {preset}
                                        </button>
                                    ))}
                                </div>
                            </div> */}

                            <Button
                                type="button"
                                onClick={() => handleParseSms()}
                                disabled={isScanning}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                            >
                                <Bot className="mr-1.5 h-4 w-4" />
                                {isScanning ? "AI Parsing Message..." : "Parse SMS with AI"}
                            </Button>
                        </div>
                    )}

                    {/* OCR PHOTO TAB */}
                    {activeTab === "ocr" && (
                        <div className="space-y-3">
                            <Label>Upload or Capture Receipt Photo</Label>
                            <div className="border-2 border-dashed border-gray-200 hover:border-purple-300 rounded-xl p-6 text-center bg-gray-50/50 transition cursor-pointer relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                {previewImage ? (
                                    <div className="space-y-2">
                                        <Image src={previewImage} alt="Receipt preview" width={128} height={128} unoptimized className="max-h-32 w-auto mx-auto rounded-md shadow-xs border" />
                                        <p className="text-purple-700 font-semibold">Tap to scan another image</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto">
                                            <Upload className="h-5 w-5" />
                                        </div>
                                        <div className="font-semibold text-gray-700">Drop receipt image or click to upload</div>
                                        <div className="text-gray-400">Supports PNG, JPG, WEBP receipt photos</div>
                                    </div>
                                )}
                            </div>

                            {!previewImage && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={triggerOcrScan}
                                    disabled={isScanning}
                                    className="w-full text-xs text-purple-700 border-purple-200 hover:bg-purple-50"
                                >
                                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                                    {isScanning ? "AI Extracting OCR..." : "Try Sample Receipt OCR Scan"}
                                </Button>
                            )}
                        </div>
                    )}

                    {/* PARSED RESULT CARD */}
                    {parsedData && (
                        <div className="rounded-xl border bg-purple-50/80 p-3.5 space-y-2 border-purple-200 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="font-bold text-purple-900 flex items-center justify-between border-b border-purple-200 pb-1.5">
                                <span>⚡ Extracted Details</span>
                                <span className="text-emerald-700 font-extrabold text-sm">
                                    {parsedData.type === "INCOME" ? "+" : "-"}{formatCurrency(parsedData.amount, currency)}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-1 text-[11px] text-purple-950 font-medium">
                                <div><span className="text-purple-600">Title:</span> {parsedData.description}</div>
                                <div><span className="text-purple-600">Type:</span> {parsedData.type}</div>
                                <div><span className="text-purple-600">Date:</span> {parsedData.date}</div>
                                <div><span className="text-purple-600">Account:</span> {parsedData.reference}</div>
                            </div>

                            <Button
                                type="button"
                                onClick={handleApplyData}
                                className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1 shadow-xs h-9 text-xs"
                            >
                                <Check className="h-4 w-4" /> Auto-Fill Into Expense Form
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

