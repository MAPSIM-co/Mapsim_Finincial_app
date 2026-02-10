// src/components/FundForm.js
import React, { useState, useEffect } from "react";
import { Box, TextField, Button, MenuItem, Paper, Typography } from "@mui/material";
import { api } from "../api/api"; // مطمئن شو api.baseURL درست است

const FUND_TYPES = [
  "درآمد ثابت",
  "سهامی",
  "مختلط",
  "طلا",
  "شاخصی",
  "بازارگردانی",
  "جسورانه",
  "املاک و مستغلات",
  "پروژه",
  "کالایی",
  "ETF",
  "طلا مبتنی بر گواهی سپرده",
];

const PAYOUT_PERIODS = [
  "ماهیانه",
  "سه ماهه",
  "شش ماهه",
  "سالانه",
  "بدون تقسیم سود"
];

const FundForm = ({ initialData = null, onSaved }) => {
  const [form, setForm] = useState({
    fund_name: "",
    fund_type: "",
    payout_period: "ماهیانه",
    payout_day: "",
    description: ""
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      // normalize server keys if necessary
      setForm({
        fund_name: initialData.fund_name || "",
        fund_type: initialData.fund_type || "",
        payout_period: initialData.payout_period || "ماهیانه",
        payout_day: initialData.payout_day || "",
        description: initialData.description || ""
      });
    } else {
      setForm({
        fund_name: "",
        fund_type: "",
        payout_period: "ماهیانه",
        payout_day: "",
        description: ""
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // اگر id وجود داشته باشه، ویرایش کن، در غیر این صورت ایجاد کن
      if (initialData && initialData.id) {
        const res = await api.put(`/investment-funds/${initialData.id}`, form);
        console.log("PUT response:", res);
      } else {
        const res = await api.post("/investment-funds/", form);
        console.log("POST response:", res);
      }

      if (onSaved) onSaved();
    } catch (err) {
      // نمایش جزئیات خطا برای دیباگ
      console.error("Error saving fund:", err);

      // axios error handling (اگر از axios استفاده می‌کنی)
      if (err.response) {
        // پاسخ از سرور
        console.error("Status:", err.response.status);
        console.error("Data:", err.response.data);
        alert(`خطا در ذخیره صندوق: ${err.response.status} — ${JSON.stringify(err.response.data)}`);
      } else if (err.request) {
        // درخواست ارسال شد ولی پاسخی نرسید
        console.error("No response received:", err.request);
        alert("خطا: پاسخی از سرور دریافت نشد. سرور را چک کن.");
      } else {
        // خطای دیگر
        alert(`خطا در ذخیره: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }} elevation={2}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        {initialData ? "ویرایش صندوق" : "افزودن صندوق جدید"}
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        <TextField
          label="نام صندوق"
          name="fund_name"
          value={form.fund_name}
          onChange={handleChange}
          required
        />

        <TextField
          select
          label="نوع صندوق"
          name="fund_type"
          value={form.fund_type}
          onChange={handleChange}
          sx={{ minWidth: 200 }}
          required
        >
          {FUND_TYPES.map((t) => (
            <MenuItem value={t} key={t}>
              {t}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="دوره پرداخت سود"
          name="payout_period"
          value={form.payout_period}
          onChange={handleChange}
          sx={{ minWidth: 200 }}
          required
        >
          {PAYOUT_PERIODS.map((p) => (
            <MenuItem value={p} key={p}>
              {p}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="روز پرداخت سود"
          name="payout_day"
          value={form.payout_day}
          onChange={handleChange}
        />

        <TextField
          label="توضیحات"
          name="description"
          value={form.description}
          onChange={handleChange}
          multiline
          sx={{ minWidth: 300 }}
        />

        <Button variant="contained" type="submit" disabled={loading} sx={{ height: 50 }}>
          {loading ? "در حال ذخیره..." : initialData ? "ذخیره" : "افزودن صندوق"}
        </Button>
      </Box>
    </Paper>
  );
};

export default FundForm;