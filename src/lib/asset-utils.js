export function applyTxDeltaToAssets(assetsList = [], oldTx = null, newTx = null) {
    let updated = (assetsList || []).map((a) => ({
        ...a,
        value: Number(a.value || 0),
    }));

    // 1. Reverse old transaction effect on asset balances (if oldTx exists)
    if (oldTx) {
        const oldAmt = Number(oldTx.amount || 0);
        const oldFromRef = oldTx.reference;
        const oldToRef = oldTx.notes;

        if (oldTx.type === "TRANSFER") {
            updated = updated.map((a) => {
                if (a.name === oldFromRef || a.id === oldFromRef)
                    return { ...a, value: Math.max(0, a.value + oldAmt) };
                if (a.name === oldToRef || a.id === oldToRef)
                    return { ...a, value: Math.max(0, a.value - oldAmt) };
                return a;
            });
        } else if (oldTx.type === "EXPENSE") {
            updated = updated.map((a, idx) => {
                const isMatch =
                    a.name === oldFromRef || a.id === oldFromRef || (idx === 0 && !oldFromRef);
                return isMatch ? { ...a, value: Math.max(0, a.value + oldAmt) } : a;
            });
        } else if (oldTx.type === "INCOME") {
            updated = updated.map((a, idx) => {
                const isMatch =
                    a.name === oldFromRef || a.id === oldFromRef || (idx === 0 && !oldFromRef);
                return isMatch ? { ...a, value: Math.max(0, a.value - oldAmt) } : a;
            });
        }
    }

    // 2. Apply new transaction effect on asset balances (if newTx exists)
    if (newTx) {
        const newAmt = Number(newTx.amount || 0);
        const newFromRef = newTx.reference;
        const newToRef = newTx.notes;

        if (newTx.type === "TRANSFER") {
            updated = updated.map((a) => {
                if (a.name === newFromRef || a.id === newFromRef)
                    return { ...a, value: Math.max(0, a.value - newAmt) };
                if (a.name === newToRef || a.id === newToRef)
                    return { ...a, value: Math.max(0, a.value + newAmt) };
                return a;
            });
        } else if (newTx.type === "EXPENSE") {
            updated = updated.map((a, idx) => {
                const isMatch =
                    a.name === newFromRef || a.id === newFromRef || (idx === 0 && !newFromRef);
                return isMatch ? { ...a, value: Math.max(0, a.value - newAmt) } : a;
            });
        } else if (newTx.type === "INCOME") {
            updated = updated.map((a, idx) => {
                const isMatch =
                    a.name === newFromRef || a.id === newFromRef || (idx === 0 && !newFromRef);
                return isMatch ? { ...a, value: Math.max(0, a.value + newAmt) } : a;
            });
        }
    }

    return updated;
}
