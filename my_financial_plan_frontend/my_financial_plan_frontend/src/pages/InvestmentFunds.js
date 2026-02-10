// src/pages/InvestmentFunds.js
import React, { useEffect, useState, useRef } from "react";
import {
  Paper,
  Typography,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  IconButton
} from "@mui/material";

import { api } from "../api/api";
import FundForm from "../components/FundForm";
import ActiveInvestmentForm from "../components/ActiveInvestmentForm";
import { motion } from "framer-motion";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const InvestmentFunds = () => {
  const [fundTypes, setFundTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("");

  const [funds, setFunds] = useState([]);
  const [selectedFund, setSelectedFund] = useState(null);

  const [actives, setActives] = useState([]);

  const [editActive, setEditActive] = useState(null);

  // ریفرنس فرم برای اسکرول اتوماتیک
  const formRef = useRef(null);

  // --- ویرایش ---
  const handleEdit = (item) => {
    console.log("✏ Editing item:", item);

    // مقدار ماه همیشه باید string باشد
    const fixedItem = {
      ...item,
      month: item.month ? String(item.month).trim() : "",
    };

    setEditActive(fixedItem);

    // اسکرول اتوماتیک
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
  };

  // --- حذف ---
  const handleDelete = async (id) => {
    if (!window.confirm("آیا مطمئن هستید که می‌خواهید حذف کنید؟")) return;

    try {
      await api.delete(`/active-investments/${id}`);
      fetchActives(selectedType);
    } catch (err) {
      console.error("❌ خطا در حذف داده", err);
    }
  };

  // --- دریافت انواع صندوق ---
  const fetchFundTypes = async () => {
    try {
      const res = await api.get("/investment-funds/types");
      setFundTypes(res.data);
    } catch (err) {
      console.error("❌ خطا در دریافت نوع صندوق:", err);
    }
  };

  // --- دریافت لیست صندوق‌ها ---
  const fetchFunds = async () => {
    try {
      const res = await api.get("/investment-funds/");
      setFunds(res.data);
    } catch (err) {
      console.error("❌ خطا در دریافت صندوق‌ها:", err);
    }
  };

  // --- دریافت Active ها ---
  const fetchActives = async (fundType) => {
    try {
      const res = await api.get(`/active-investments/by-fund-type/${fundType}`);
      setActives(res.data);
    } catch (err) {
      console.error("❌ خطا در دریافت سود ها:", err);
    }
  };

  useEffect(() => {
    fetchFundTypes();
    fetchFunds();
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* === انتخاب نوع صندوق === */}
      <Paper sx={{ p: 3, mb: 3 }} elevation={2}>
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "gray" }}>
          انتخاب نوع صندوق
        </Typography>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>نوع صندوق</InputLabel>
          <Select
            value={selectedType}
            label="نوع صندوق"
            onChange={(e) => {
              const type = e.target.value;
              setSelectedType(type);
              setSelectedFund(null);
              fetchActives(type);
            }}
            sx={{ fontWeight: "bold", color: "#f60a31ff" }}
          >
            {fundTypes.length ? (
              fundTypes.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>در حال بارگذاری...</MenuItem>
            )}
          </Select>
        </FormControl>
      </Paper>

      {/* === جدول Active === */}
      {selectedType && (
        <Paper sx={{ p: 3, mb: 3 }} elevation={2}>
          <Typography variant="h6" sx={{ mb: 2 }} style={{ color: "#0f5100ff", fontWeight: "bold" }}>
            وضعیت‌های دریافتی ({selectedType})
          </Typography>

          {actives.length === 0 ? (
            <Typography color="gray">هیچ رکوردی موجود نیست.</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="center" style={{ color: "#030303ff", fontWeight: "bold" }}>صندوق</TableCell>
                    <TableCell align="center" style={{ color: "#030303ff", fontWeight: "bold" }}>ماه</TableCell>
                    <TableCell align="center" style={{ color: "#030303ff", fontWeight: "bold" }}>مبلغ</TableCell>
                    <TableCell align="center" style={{ color: "#030303ff", fontWeight: "bold" }}>واحد باقی‌مانده</TableCell>
                    <TableCell align="center" style={{ color: "#030303ff", fontWeight: "bold" }}>واحد فروخته‌شده</TableCell>
                    <TableCell align="center" style={{ color: "#030303ff", fontWeight: "bold" }}>سود هر واحد</TableCell>
                    <TableCell align="center" style={{ color: "#030303ff", fontWeight: "bold" }}>ارزش ذخیره</TableCell>
                    <TableCell align="center" style={{ color: "#030303ff", fontWeight: "bold" }}>سود خالص</TableCell>
                    <TableCell align="center" style={{ color: "#030303ff", fontWeight: "bold" }}>سود کل</TableCell>
                    <TableCell align="center" style={{ color: "#030303ff", fontWeight: "bold" }}>عملیات</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {actives.map((a) => {
                    const profit = a.calculated_profit || 0;
                    const profitPerUnit = a.profit_per_unit || 0;
                    const totalProfit = (a.saved_value || 0) + profit;

                    return (
                      <TableRow key={a.id}>
                        <TableCell align="center" style={{ color: "#a508f4ff", fontWeight: "bold" }}>{a.fund_name}</TableCell>
                        <TableCell align="center" style={{ color: "#f59505ff", fontWeight: "bold" }}>{a.month}</TableCell>
                        <TableCell align="center" style={{ color: "#127009ff", fontWeight: "bold" }}>{a.amount_at_fund.toLocaleString()} تومان</TableCell>
                        <TableCell align="center" style={{ color: "#009df8ff", fontWeight: "bold" }}>{a.units_left}</TableCell>
                        <TableCell align="center" style={{ color: "#ff0000ff", fontWeight: "bold" }}>{a.units_sold}</TableCell>
                        <TableCell align="center" style={{ color: "#08cd1fff", fontWeight: "bold" }}>{profitPerUnit.toLocaleString()} تومان</TableCell>
                        <TableCell align="center" style={{ color: "#4b04efff", fontWeight: "bold" }}>{a.saved_value.toLocaleString()} تومان</TableCell>
                        <TableCell align="center" style={{ color: "#f304e3ff", fontWeight: "bold" }}>{profit.toLocaleString()} تومان</TableCell>
                        <TableCell align="center" style={{ color: "#259a01ff", fontWeight: "bold" }}>{totalProfit.toLocaleString()} تومان</TableCell>

                        <TableCell>
                          <IconButton onClick={() => handleEdit(a)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(a.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {/* === فرم Active Investment === */}
      {selectedType && (
        <Paper sx={{ p: 3, mb: 3 }} elevation={3} ref={formRef}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
            افزودن / ویرایش سود ({selectedType})
          </Typography>

          <ActiveInvestmentForm
            funds={funds.filter((f) => f.fund_type === selectedType)}
            initialData={editActive}
            onSaved={() => {
              setEditActive(null);
              fetchActives(selectedType);
            }}
          />
        </Paper>
      )}

      
      {/* === کارت انتخاب صندوق (جدولی) === */}
      {selectedType && (
        <Paper sx={{ p: 3, mb: 3 }} elevation={2}>
          <Typography variant="h6" style={{ color: "#0b0b0cff", fontWeight: "bold" }}>
            صندوق های موجود برای  ({selectedType})
          </Typography>

          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell style={{ color: "#1808f4ff", fontWeight: "bold" }}>نام صندوق</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {funds
                  .filter((f) => f.fund_type === selectedType)
                  .map((f) => (
                    <TableRow
                      key={f.id}
                      hover
                      onClick={() => setSelectedFund(f)}
                      style={{
                        cursor: "pointer",
                        backgroundColor:
                          selectedFund?.id === f.id ? "#100e0fff" : "transparent",
                      }}
                    >
                      <TableCell style={{ color: "#af0af6ff", fontWeight: "bold" }}>
                        {f.fund_name}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          {!funds.some((f) => f.fund_type === selectedType) && (
            <Typography color="gray">هیچ صندوقی یافت نشد.</Typography>
          )}
        </Paper>
      )}

      {/* === فرم صندوق جدید === */}
      <Paper sx={{ p: 3 }} elevation={3}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
          اضافه کردن صندوق جدید
        </Typography>

        <FundForm onSaved={fetchFunds} />
      </Paper>
    </motion.div>
  );
};

export default InvestmentFunds;
