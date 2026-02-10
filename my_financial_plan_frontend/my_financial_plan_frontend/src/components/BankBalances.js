import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Grid, TextField, MenuItem, Box, Button } from "@mui/material";
import { api } from "../api/api";
import jalaali from "jalaali-js";


const getTodayJalali = () => {
  const g = new Date();
  const j = jalaali.toJalaali(g.getFullYear(), g.getMonth() + 1, g.getDate());
  return {
    year: j.jy,
    month: j.jm,
    day: j.jd
  };
};

const PERSIAN_MONTHS = [
  { name: "فروردین", number: 1 }, { name: "اردیبهشت", number: 2 }, { name: "خرداد", number: 3 },
  { name: "تیر", number: 4 }, { name: "مرداد", number: 5 }, { name: "شهریور", number: 6 },
  { name: "مهر", number: 7 }, { name: "آبان", number: 8 }, { name: "آذر", number: 9 },
  { name: "دی", number: 10 }, { name: "بهمن", number: 11 }, { name: "اسفند", number: 12 }
];

// const stringToDarkColor = (str) => {
//   let hash = 0;
//   for (let i = 0; i < str.length; i++) {
//     hash = str.charCodeAt(i) + ((hash << 5) - hash);
//   }

//   let color = '#';
//   for (let i = 0; i < 3; i++) {
//     // مقدار را بین 50 و 200 محدود می‌کنیم (تیره تا متوسط)
//     const value = ((hash >> (i * 8)) & 0xFF) % 150 + 50;
//     color += ('00' + value.toString(16)).substr(-2);
//   }
//   return color;
// };






// const getCurrentPersianYear = () => {
//   const today = new Date();
//   let year = today.getFullYear() - 621;
//   const month = today.getMonth() + 1;
//   const day = today.getDate();
//   if (month < 3 || (month === 3 && day < 20)) year -= 1;
//   return year;
// };

// const getCurrentPersianMonthDay = () => {
//   const today = new Date();
//   // approximate conversion: use gregorian month/day as fallback
//   return { month: today.getMonth() + 1, day: today.getDate() };
// };

// const getTodayJalali = () => {
//   const g = new Date();
//   const j = jalaali.toJalaali(g.getFullYear(), g.getMonth() + 1, g.getDate());
//   return {
//     year: j.jy,
//     month: j.jm,
//     day: j.jd
//   };
// };

const BankCard = ({ bank, defaultDate }) => {
  const [year, setYear] = useState(defaultDate.year);
  const [month, setMonth] = useState(defaultDate.month);
  const [day, setDay] = useState(defaultDate.day);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchBalance = async (y, m, d) => {
    setLoading(true);
    try {
      const res = await api.get("/bank-balance/", { 
        params: { bank_name: bank.id, year: y, month: m, day: d } 
      });

      // داده‌ها را جداگانه ذخیره می‌کنیم
      setBalance({
        lastDeposit: res.data.last_deposit_balance || 0,
        withdrawals: res.data.total_withdrawals || 0,
        final: res.data.final_balance || 0
      });
    } catch (err) {
      console.error("Error fetching balance:", err);
      setBalance({ lastDeposit: 0, withdrawals: 0, final: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance(year, month, day);
  }, []);

  const onApply = () => fetchBalance(year, month, day);

  return (
    <Card variant="outlined" sx={{ minWidth: 260 }}>
      <CardContent>

        <Typography 
          variant="h6" 
          sx={{ mb: 1 }}  
          style={{ color: bank.color || "#000000", fontWeight: "bold" }}
        >
          {"بانک "}{bank.bank_name}
        </Typography>


        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <TextField select label="سال" value={year} onChange={e => setYear(Number(e.target.value))} sx={{ minWidth: 120 }}>
            {Array.from({ length: 101 }, (_, i) => 1400 + i).map(y => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </TextField>

          <TextField select label="ماه" value={month} onChange={e => setMonth(Number(e.target.value))} sx={{ minWidth: 140 }}>
            {PERSIAN_MONTHS.map(m => <MenuItem key={m.number} value={m.number}>{m.name}</MenuItem>)}
          </TextField>
          <TextField select label="روز" value={day} onChange={e => setDay(Number(e.target.value))} sx={{ minWidth: 120 }}>
            <MenuItem value=""><em>روز</em></MenuItem>
            {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
          </TextField>
          <Button variant="contained" onClick={onApply}  style={{ color: "#f0f806ff", fontWeight: "bold" }}>نمایش</Button>
        </Box>
        <Typography variant="subtitle2" style={{ color: "#028324ff", fontWeight: "bold" }}>آخرین موجودی واریزی</Typography>
        <Typography variant="body1" style={{ color: "#058cf3ff", fontWeight: "bold" }}>{loading ? "در حال بارگذاری..." : (balance ? `${balance.lastDeposit.toLocaleString()} تومان` : "-")}</Typography>

        <Typography variant="subtitle2" style={{ color: "#f60a0aff", fontWeight: "bold" }}>کل برداشت‌ها</Typography>
        <Typography variant="body1" style={{ color: "#61091cff", fontWeight: "bold" }}>{loading ? "در حال بارگذاری..." : (balance ? `${balance.withdrawals.toLocaleString()} تومان` : "-")}</Typography>

        <Typography variant="subtitle2" style={{ color: "#f6780aff", fontWeight: "bold" }}>موجودی نهایی</Typography>
        <Typography variant="h5" sx={{ mt: 1, fontWeight: 'bold' }} style={{ color: "#c005f4ff", fontWeight: "bold" }}>
          {loading ? 'در حال بارگذاری...' : (balance ? `${balance.final.toLocaleString()} تومان` : '-')}
        </Typography>

      </CardContent>
    </Card>
  );
};

const BankBalances = () => {
  const [banks, setBanks] = useState([]);
  //const [defaultDate, setDefaultDate] = useState({ year: getCurrentPersianYear(), ...getCurrentPersianMonthDay() });
  const [defaultDate, setDefaultDate] = useState(getTodayJalali());

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await api.get('/accounts/');
        setBanks(res.data || []);
      } catch (err) {
        console.error('Error fetching banks:', err);
        setBanks([]);
      }
    };
    fetchBanks();
  }, []);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}  style={{ color: "#02c27fff", fontWeight: "bold" }}>موجودی بانک‌ها</Typography>
      <Grid container spacing={2}>
        {banks.map(b => (
          <Grid item key={b.id} xs={12} sm={6} md={4}>
            <BankCard bank={b} defaultDate={defaultDate} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default BankBalances;
