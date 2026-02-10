// src/components/ActiveInvestmentTable.js
import React from "react";
import { Table, TableHead, TableRow, TableCell, TableBody, IconButton, Paper, TableContainer, IconButton,} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const ActiveInvestmentTable = ({ rows = [], onEdit = () => {}, onDelete = () => {} }) => {

  const calcProfitReceived = (r) => {
    // محاسبه: (تعداد واحد مانده × سود هر واحد) + ذخیره ارزش دارایی
    const units = Number(r.units_left || 0);
    const profitPerUnit = Number(r.profit_per_unit || 0);
    const saved = Number(r.saved_value || 0);
    return (units * profitPerUnit) + saved;
  };

  return (
    <TableContainer component={Paper} sx={{ mb: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ماه</TableCell>
            <TableCell align="right">مبلغ نزد صندوق</TableCell>
            <TableCell align="right">تعداد واحد مانده</TableCell>
            <TableCell align="right">واحد فروخته شده</TableCell>
            <TableCell align="right">سود هر واحد</TableCell>
            <TableCell align="right">ذخیره</TableCell>
            <TableCell align="right">سود دریافتی (محاسبه)</TableCell>
            <TableCell>عملیات</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.month}</TableCell>
              <TableCell align="right">{Number(r.amount_at_fund||0).toLocaleString()}</TableCell>
              <TableCell align="right">{r.units_left}</TableCell>
              <TableCell align="right">{r.units_sold}</TableCell>
              <TableCell align="right">{Number(r.profit_per_unit||0).toLocaleString()}</TableCell>
              <TableCell align="right">{Number(r.saved_value||0).toLocaleString()}</TableCell>
              <TableCell align="right">{Number(calcProfitReceived(r)).toLocaleString()}</TableCell>
              <TableCell>
                <IconButton size="small" onClick={() => onEdit(r)}><EditIcon fontSize="small" /></IconButton>
                <IconButton size="small" onClick={() => onDelete(r.id)}><DeleteIcon fontSize="small" /></IconButton>
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} align="center">موردی برای نمایش وجود ندارد.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ActiveInvestmentTable;