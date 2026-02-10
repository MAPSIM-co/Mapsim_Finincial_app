import React, { useState, useEffect } from "react";
import { TextField, Button, Box, MenuItem } from "@mui/material";
import { api } from "../api/api";

const TypeForm = ({ onSubmit, initialData }) => {
  const [form, setForm] = useState({
    topic: "",
    allocated_budget: 0,
    bank: "",
    description: "",
  });
  const [banks, setBanks] = useState([]);

  useEffect(() => {
    // بارگذاری بانک‌ها
    const fetchBanks = async () => {
      try {
        const res = await api.get("/accounts/");
        setBanks(res.data);
      } catch (error) {
        console.error("خطا در دریافت بانک‌ها:", error);
      }
    };
    fetchBanks();
  }, []);

  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "allocated_budget" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    setForm({ topic: "", allocated_budget: 0, bank: "", description: "" });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 8, display: "flex", flexWrap: "wrap", gap: 2 }} >
      <TextField
        label="موضوع"
        name="topic"
        value={form.topic}
        onChange={handleChange}
        required
      />
      <TextField
        label="بودجه"
        name="allocated_budget"
        type="number"
        value={form.allocated_budget}
        onChange={handleChange}
        required
        sx={{ color: "darkgreen" }}
      />
      <TextField
        select
        label="بانک"
        name="bank"
        value={form.bank}
        onChange={handleChange}
        sx={{ minWidth: 200 }}
      >
        <MenuItem value="">
          <em>انتخاب بانک</em>
        </MenuItem>
        {banks.map((b) => (
          <MenuItem key={b.id} value={b.bank_name}>
            {b.bank_name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="توضیحات"
        name="description"
        value={form.description}
        onChange={handleChange}
        sx={{ minWidth: 200 }}
      />
      <Button type="submit" variant="contained" color="primary">
        {initialData ? "ویرایش" : "افزودن"}
      </Button>
    </Box>
  );
};

export default TypeForm;