"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AssetManager } from "@/components/assets/asset-manager";

export default function AssetsPage() {
    const [assets, setAssets] = useState([]);

    const syncAssetsToStorage = (assetList) => {
        setAssets(assetList);
        localStorage.setItem("finsight_assets", JSON.stringify(assetList));
        const total = assetList.reduce((sum, a) => sum + Number(a.value || 0), 0);
        localStorage.setItem("finsight_wallet_balance", String(total));
        window.dispatchEvent(
            new CustomEvent("finsight:assets-updated", { detail: { assets: assetList, total } })
        );
        window.dispatchEvent(
            new CustomEvent("finsight:transactions-updated", { detail: {} })
        );
    };

    useEffect(() => {
        async function load() {
            let stored = [];
            const storedStr = localStorage.getItem("finsight_assets");
            if (storedStr) {
                try {
                    const parsed = JSON.parse(storedStr);
                    if (Array.isArray(parsed) && parsed.length > 0) stored = parsed;
                } catch { }
            }

            let dbAssets = [];
            try {
                const res = await fetch("/api/assets");
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) dbAssets = data;
                }
            } catch { }

            const assetMap = new Map();


            stored.forEach((ast) => {
                if (ast && (ast.id || ast.name)) {
                    const key = (ast.name || ast.id).toLowerCase().trim();
                    assetMap.set(key, ast);
                }
            });

            // Insert DB assets ONLY if not present in stored
            dbAssets.forEach((ast) => {
                if (ast && (ast.id || ast.name)) {
                    const key = (ast.name || ast.id).toLowerCase().trim();
                    if (!assetMap.has(key)) {
                        assetMap.set(key, ast);
                    }
                }
            });

            let finalAssets = Array.from(assetMap.values());

            syncAssetsToStorage(finalAssets);
        }

        const timeoutId = setTimeout(load, 0);

        const handleAssetsUpdated = (e) => {
            if (e.detail?.assets) {
                setAssets(e.detail.assets);
            }
        };
        window.addEventListener("finsight:assets-updated", handleAssetsUpdated);
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener("finsight:assets-updated", handleAssetsUpdated);
        };
    }, []);

    async function handleSave(data) {
        const valNum = parseFloat(data.value || 0);
        const newAsset = {
            id: "ast_" + Date.now(),
            ...data,
            value: valNum,
            createdAt: new Date().toISOString(),
        };

        const updated = [...assets, newAsset];
        syncAssetsToStorage(updated);
        toast.success(`Account "${newAsset.name}" created with balance ${valNum}!`);

        fetch("/api/assets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        }).then(async (res) => {
            if (res.ok) {
                const saved = await res.json();
                if (saved && saved.id) {
                    const replaced = updated.map((a) => (a.id === newAsset.id ? { ...a, id: saved.id } : a));
                    syncAssetsToStorage(replaced);
                }
            }
        }).catch(() => { });
    }

    async function handleUpdateBalance(assetId, newValue) {
        const valNum = parseFloat(newValue || 0);
        const updated = assets.map((a) => (a.id === assetId || a.name === assetId ? { ...a, value: valNum } : a));
        syncAssetsToStorage(updated);
        toast.success("Account balance updated!");

        fetch(`/api/assets/${assetId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ value: valNum }),
        }).catch(() => { });
    }

    async function handleDelete(id) {
        if (!confirm("Delete this asset account?")) return;
        const updated = assets.filter((a) => a.id !== id && a.name !== id);
        syncAssetsToStorage(updated);
        toast.success("Asset account deleted & wallet balance updated!");

        fetch(`/api/assets/${id}`, { method: "DELETE" }).catch(() => { });
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Assets & Net Worth</h1>
            <AssetManager
                assets={assets}
                onSave={handleSave}
                onUpdateBalance={handleUpdateBalance}
                onDelete={handleDelete}
            />
        </div>
    );
}
