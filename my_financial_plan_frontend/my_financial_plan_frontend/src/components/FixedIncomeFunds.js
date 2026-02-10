// src/components/FixedIncomeFunds.js
import React, { useEffect, useState } from "react";
import { api } from "../api/api";
import { Paper, Typography, Grid, Button, Box } from "@mui/material";
import FundForm from "./FundForm";
import FundTable from "./FundTable";
import ActiveInvestmentForm from "./ActiveInvestmentForm";
import ActiveInvestmentTable from "./ActiveInvestmentTable";

const FixedIncomeFunds = () => {
  const [step, setStep] = useState(1);

  const [fundTypes, setFundTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("");

  const [funds, setFunds] = useState([]);
  const [selectedFund, setSelectedFund] = useState(null);

  const [activeList, setActiveList] = useState([]);
  const [editingFund, setEditingFund] = useState(null);
  const [editingActive, setEditingActive] = useState(null);

  // fetch fund types
  const fetchFundTypes = async () => {
    try {
      const res = await api.get("/funds/types");
      setFundTypes(res.data || []);
    } catch (err) {
      console.error(err);
      setFundTypes([]);
    }
  };

  const fetchFundsByType = async (type) => {
    try {
      const res = await api.get(`/funds/by-type/${encodeURIComponent(type)}`);
      setFunds(res.data || []);
    } catch (err) {
      console.error(err);
      setFunds([]);
    }
  };

  const fetchActiveByFund = async (fundId) => {
    try {
      const res = await api.get(`/active-funds/by-fund/${fundId}`);
      setActiveList(res.data || []);
    } catch (err) {
      console.error(err);
      setActiveList([]);
    }
  };

  useEffect(() => {
    fetchFundTypes();
  }, []);

  // fund CRUD
  const handleCreateOrUpdateFund = async () => {
    await fetchFundsByType(selectedType);
    setEditingFund(null);
  };

  const handleDeleteFund = async (fundId) => {
    if (!window.confirm("آیا مطمئن هستید صندوق حذف شود؟")) return;
    try {
      await api.delete(`/funds/${fundId}`);
      await fetchFundsByType(selectedType);
    } catch (err) {
      console.error(err);
      alert("خطا در حذف صندوق");
    }
  };

  // active investment CRUD
  const handleCreateOrUpdateActive = async () => {
    await fetchActiveByFund(selectedFund.id);
    setEditingActive(null);
  };

  const handleDeleteActive = async (id) => {
    if (!window.confirm("آیا مطمئن هستید حذف شود؟")) return;
    try {
      await api.delete(`/active-funds/${id}`);
      await fetchActiveByFund(selectedFund.id);
    } catch (err) {
      console.error(err);
      alert("خطا در حذف سرمایه‌گذاری فعال");
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>صندوق‌های سرمایه‌گذاری</Typography>

      {/* STEP 1: select fund type */}
      {step === 1 && (
        <>
          <Typography variant="h6" gutterBottom>انتخاب نوع صندوق</Typography>
          <Grid container spacing={2}>
            {fundTypes.map((t) => (
              <Grid item xs={12} sm={6} md={4} key={t}>
                <Button fullWidth variant="contained" onClick={() => { setSelectedType(t); fetchFundsByType(t); setStep(2); }}>
                  {t}
                </Button>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* STEP 2: list funds of type */}
      {step === 2 && (
        <>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <Button variant="outlined" onClick={() => { setStep(1); setFunds([]); setSelectedType(""); }}>بازگشت</Button>
            <Button variant="contained" onClick={() => setEditingFund({ fund_type: selectedType })}>+ افزودن صندوق جدید</Button>
          </Box>

          <Typography variant="h6" gutterBottom>صندوق‌های نوع: {selectedType}</Typography>

          {editingFund && (
            <FundForm initialData={editingFund.id ? editingFund : { fund_type: selectedType }} onSaved={handleCreateOrUpdateFund} />
          )}

          <FundTable
            funds={funds}
            onSelect={(f) => { setSelectedFund(f); fetchActiveByFund(f.id); setStep(3); }}
            onEdit={(f) => setEditingFund(f)}
            onDelete={handleDeleteFund}
          />
        </>
      )}

      {/* STEP 3: active investments for selected fund */}
      {step === 3 && selectedFund && (
        <>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <Button variant="outlined" onClick={() => { setStep(2); setSelectedFund(null); setActiveList([]); }}>بازگشت</Button>
            <Button variant="contained" onClick={() => setEditingActive({ fund_id: selectedFund.id })}>+ افزودن سرمایه‌گذاری فعال</Button>
          </Box>

          <Typography variant="h6" gutterBottom>سرمایه‌گذاری‌های فعال — {selectedFund.fund_name}</Typography>

          {editingActive && (
            <ActiveInvestmentForm initialData={editingActive.id ? editingActive : { fund_id: selectedFund.id }} fundId={selectedFund.id} onSaved={handleCreateOrUpdateActive} />
          )}

          <ActiveInvestmentTable rows={activeList} onEdit={(r) => setEditingActive(r)} onDelete={handleDeleteActive} />
        </>
      )}
    </Paper>
  );
};

export default FixedIncomeFunds;