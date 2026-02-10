// src/components/ActiveInvestmentForm.js
import React, { useState, useEffect } from "react";
import { Box, TextField, Button, MenuItem, Paper, Typography, Grid } from "@mui/material";
import jalaali from "jalaali-js";
import { api } from "../api/api";

// ماه‌های فارسی
const PERSIAN_MONTHS = [
  { name: "فروردین", number: 1 },
  { name: "اردیبهشت", number: 2 },
  { name: "خرداد", number: 3 },
  { name: "تیر", number: 4 },
  { name: "مرداد", number: 5 },
  { name: "شهریور", number: 6 },
  { name: "مهر", number: 7 },
  { name: "آبان", number: 8 },
  { name: "آذر", number: 9 },
  { name: "دی", number: 10 },
  { name: "بهمن", number: 11 },
  { name: "اسفند", number: 12 }
];

const getTodayJalali = () => {
  const g = new Date();
  const j = jalaali.toJalaali(g.getFullYear(), g.getMonth() + 1, g.getDate());
  return { day: j.jd, month: j.jm, year: j.jy };
};

// دریافت سال جاری شمسی
const getCurrentPersianYear = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  
  // تقریبی: سال شمسی ≈ سال میلادی - 621 (تا معادل‌سازی دقیق تر)
  let persianYear = year - 621;
  if (month < 3 || (month === 3 && day < 20)) {
    persianYear--;
  }
  return persianYear;
};

const ActiveInvestmentForm = ({ funds = [], initialData = null, onSaved }) => {
  const currentPersianYear = getCurrentPersianYear();
  
  const [form, setForm] = useState({
    fund_id: "",
    month: "",
    monthNumber: "",
    year: currentPersianYear,
    amount_at_fund: "",
    units_left: "",
    units_sold: 0,
    profit_per_unit: "",
    saved_value: "",
    // date parts for combo boxes
    profit_received_day: "",
    profit_received_monthNumber: "",
    profit_received_year: currentPersianYear,
    sell_day: "",
    sell_monthNumber: "",
    sell_year: currentPersianYear,
    description: ""
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      // اگر month فقط نام ماه است (مثل "آذر")، آن را پار کنیم
      let monthName = initialData.month || "";
      let monthNum = "";
      let year = currentPersianYear;
      
      // اگر month شامل سال است (مثل "آذر 1404")
      if (monthName.includes(" ")) {
        const parts = monthName.split(" ");
        monthName = parts[0];
        year = parseInt(parts[1], 10) || currentPersianYear;
      }
      
      const foundMonth = PERSIAN_MONTHS.find(m => m.name === monthName);
      monthNum = foundMonth ? foundMonth.number : "";
      
      // parse profit_received_date and sell_date into parts if present
      const parseDateParts = (d) => {
        if (!d) return { day: "", monthNumber: "", year: currentPersianYear };
        // expecting format like: 1404-09-16
        const parts = d.split("-");
        if (parts.length >= 3) {
          return { day: parts[2].replace(/^0/, ''), monthNumber: parseInt(parts[1], 10), year: parseInt(parts[0], 10) };
        }
        return { day: "", monthNumber: "", year: currentPersianYear };
      };

      const profitParts = parseDateParts(initialData.profit_received_date || "");
      const sellParts = parseDateParts(initialData.sell_date || "");

      setForm({
        fund_id: initialData.fund_id || "",
        month: monthName,
        monthNumber: monthNum,
        year: year,
        amount_at_fund: initialData.amount_at_fund || "",
        units_left: initialData.units_left || "",
        units_sold: initialData.units_sold || 0,
        profit_per_unit: initialData.profit_per_unit || "",
        saved_value: initialData.saved_value || "",
        profit_received_day: profitParts.day || "",
        profit_received_monthNumber: profitParts.monthNumber || "",
        profit_received_year: profitParts.year || currentPersianYear,
        sell_day: sellParts.day || "",
        sell_monthNumber: sellParts.monthNumber || "",
        sell_year: sellParts.year || currentPersianYear,
        description: initialData.description || ""
      });
    } else {
        const t = getTodayJalali();

        setForm({
            fund_id: "",
            month: "",
            monthNumber: "",
            year: currentPersianYear,
            amount_at_fund: "",
            units_left: "",
            units_sold: 0,
            profit_per_unit: "",
            saved_value: "",
            profit_received_day: String(t.day),
            profit_received_monthNumber: String(t.month),
            profit_received_year: t.year,
            sell_day: String(t.day),
            sell_monthNumber: String(t.month),
            sell_year: t.year,
            description: ""
        });
    }

  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "monthNumber") {
      const selectedMonth = PERSIAN_MONTHS.find(m => m.number === parseInt(value, 10));
      setForm((p) => ({ ...p, monthNumber: value, month: selectedMonth ? selectedMonth.name : "" }));
      return;
    }

    // generic handler
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Validation
      if (!form.fund_id || !form.month || !form.amount_at_fund || !form.units_left) {
        alert("لطفا تمام فیلدهای ضروری را پر کنید");
        setLoading(false);
        return;
      }

      // ساخت رشته ماه و سال
      const monthStr = `${form.year} ${form.month}`;
      
      // محاسبه سود: سود_هر_واحد × تعداد_واحد_باقی
      const profitPerUnit = form.profit_per_unit ? parseInt(form.profit_per_unit, 10) : 0;
      const unitsLeft = parseInt(form.units_left, 10);
      const calculatedProfit = profitPerUnit * unitsLeft;
      
      console.log(`📊 محاسبه سود: ${profitPerUnit} × ${unitsLeft} = ${calculatedProfit}`);

      const submitData = {
        fund_id: parseInt(form.fund_id, 10),
        month: monthStr,
        amount_at_fund: parseInt(form.amount_at_fund, 10),
        units_left: parseInt(form.units_left, 10),
        units_sold: form.units_sold ? parseInt(form.units_sold, 10) : 0,
        profit_per_unit: form.profit_per_unit ? parseInt(form.profit_per_unit, 10) : null,
        saved_value: form.saved_value ? parseInt(form.saved_value, 10) : null,
        calculated_profit: calculatedProfit,  // سود محاسبه‌شده
        profit_received_date: (form.profit_received_day && form.profit_received_monthNumber && form.profit_received_year) ?
          `${form.profit_received_year}-${String(form.profit_received_monthNumber).padStart(2,'0')}-${String(form.profit_received_day).padStart(2,'0')}` : null,
        sell_date: (form.sell_day && form.sell_monthNumber && form.sell_year) ?
          `${form.sell_year}-${String(form.sell_monthNumber).padStart(2,'0')}-${String(form.sell_day).padStart(2,'0')}` : null,
        description: form.description || null
      };

      console.log("📤 ارسال داده:", submitData);

      if (initialData && initialData.id) {
        const res = await api.put(`/active-investments/${initialData.id}`, submitData);
        console.log("✅ سرمایه گذاری فعال به روز رسانی شد:", res);
      } else {
        const res = await api.post("/active-investments/", submitData);
        console.log("✅ سرمایه گذاری فعال اضافه شد:", res);
      }

      // Reset form
      setForm({
        fund_id: "",
        month: "",
        monthNumber: "",
        year: currentPersianYear,
        amount_at_fund: "",
        units_left: "",
        units_sold: 0,
        profit_per_unit: "",
        saved_value: "",
        profit_received_date: "",
        sell_date: "",
        description: ""
      });

      if (onSaved) onSaved();
    } catch (err) {
      console.error("❌ خطا کامل:", err);
      if (err.response?.data) {
        console.error("❌ خطای سرور:", err.response.data);
        alert(`❌ خطا: ${err.response.status}\n${JSON.stringify(err.response.data)}`);
      } else if (err.message) {
        console.error("❌ خطای پیام:", err.message);
        alert(`❌ خطا: ${err.message}`);
      } else {
        alert("❌ خطای نامشناخت در ذخیره");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3, backgroundColor: "#f9f9f9" }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }} style={{ color: "#ea0606ff", fontWeight: "bold" }}>
        {initialData ? "✏️ ویرایش سود سرمایه گذاری " : "➕ افزودن سود سرمایه گذاری "}
      </Typography>

      {/* Debug info */}
      {funds.length === 0 && (
        <Typography sx={{ mb: 2, color: 'error.main', padding: 1, backgroundColor: '#ffebee' }}>
          ⚠️ هیچ صندوقی برای این نوع یافت نشد
        </Typography>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* صندوق */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="انتخاب صندوق"
              name="fund_id"
              value={form.fund_id}
              onChange={handleChange}
              required
            >
              {funds && funds.length > 0 ? (
                funds.map((fund) => (
                  <MenuItem key={fund.id} value={fund.id}>
                    {fund.fund_name} ({fund.fund_type})
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>صندوقی  موجود نیست </MenuItem>
              )}
            </TextField>
          </Grid>

          {/* ماه */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="ماه"
              name="monthNumber"
              value={form.monthNumber}
              onChange={handleChange}
              required
            >
              {PERSIAN_MONTHS.map((m) => (
                <MenuItem key={m.number} value={m.number}>
                  {m.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* سال */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="سال"
              name="year"
              value={form.year}
              onChange={handleChange}
              required
            />
          </Grid>

          {/* مبلغ */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="مبلغ نزد صندوق"
              name="amount_at_fund"
              value={form.amount_at_fund}
              onChange={handleChange}
              required
            />
          </Grid>

          {/* واحد مانده */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="واحد مانده"
              name="units_left"
              value={form.units_left}
              onChange={handleChange}
              required
            />
          </Grid>

          {/* واحد فروخته شده */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="واحد فروخته شده"
              name="units_sold"
              value={form.units_sold}
              onChange={handleChange}
            />
          </Grid>

          {/* سود هر واحد */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="سود هر واحد"
              name="profit_per_unit"
              value={form.profit_per_unit}
              onChange={handleChange}
            />
          </Grid>

          {/* ارزش ذخیره شده */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="ارزش ذخیره شده"
              name="saved_value"
              value={form.saved_value}
              onChange={handleChange}
            />
          </Grid>

          {/* تاریخ سود (روز/ماه/سال) - بخش جدا */}
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2, mb: 1 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>تاریخ واریز سود</Typography>
              <Grid container spacing={1}>
                <Grid item xs={4} sm={2}>
                  <TextField
                    select
                    fullWidth
                    label="روز"
                    name="profit_received_day"
                    value={form.profit_received_day}
                    onChange={handleChange}
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <MenuItem key={d} value={String(d)}>{d}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={8} sm={5}>
                  <TextField
                    select
                    fullWidth
                    label="ماه"
                    name="profit_received_monthNumber"
                    value={form.profit_received_monthNumber}
                    onChange={handleChange}
                  >
                    {PERSIAN_MONTHS.map((m) => (
                      <MenuItem key={m.number} value={String(m.number)}>{m.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={5}>
                  <TextField
                    fullWidth
                    type="number"
                    label="سال"
                    name="profit_received_year"
                    value={form.profit_received_year}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* تاریخ فروش (روز/ماه/سال) - بخش جدا */}
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2, mb: 1 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>تاریخ ابطال / فروش واحد</Typography>
              <Grid container spacing={1}>
                <Grid item xs={4} sm={2}>
                  <TextField
                    select
                    fullWidth
                    label="روز"
                    name="sell_day"
                    value={form.sell_day}
                    onChange={handleChange}
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <MenuItem key={d} value={String(d)}>{d}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={8} sm={5}>
                  <TextField
                    select
                    fullWidth
                    label="ماه"
                    name="sell_monthNumber"
                    value={form.sell_monthNumber}
                    onChange={handleChange}
                  >
                    {PERSIAN_MONTHS.map((m) => (
                      <MenuItem key={m.number} value={String(m.number)}>{m.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={5}>
                  <TextField
                    fullWidth
                    type="number"
                    label="سال"
                    name="sell_year"
                    value={form.sell_year}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* توضیحات */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="توضیحات"
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </Grid>

          {/* دکمه */}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? "⏳ درحال ذخیره..." : initialData ? "📝 به روز رسانی" : "➕ افزودن"}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default ActiveInvestmentForm;
