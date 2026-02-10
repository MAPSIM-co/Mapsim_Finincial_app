import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper , IconButton, } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const columns = [
  "نوع", "عنوان", "موارد", "بودجه اختصاص یافته", "بانک اختصاص یافته", "مبلغ برداشت شده", "مبلغ انتقالی", "مجموع انتقالی و برداشت", "بانک مقصد انتقال", "موجودی این ماه", "موجودی کل", "تاریخ برداشت", "توضيحات برداشت", "مبلغ مانده در حساب"
];

const MonthlyWithdrawalTable = ({ data , onEdit, onDelete}) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow style={{ color: "#070607ff", fontWeight: "bold" }}>
            {columns.map((col) => (
              <TableCell key={col} align="center" style={{ fontWeight: "bold" }}>{col}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data && data.length > 0 ? data.map((row, idx) => (
            <TableRow key={idx}>
              <TableCell align="center" style={{ color: "#030303ff", fontWeight: "bold" }}>{row.type_name}</TableCell>
              <TableCell align="center" style={{ color: "#f406f8ff", fontWeight: "bold" }}>{row.topic}</TableCell>
              <TableCell align="center" style={{ color: "#136404ff", fontWeight: "bold" }}>{row.items}</TableCell>
              <TableCell align="center" style={{ color: "#3e06f8ff", fontWeight: "bold" }}>{`${row.allocated_budget?.toLocaleString()} تومان`}</TableCell>
              <TableCell align="center" style={{ color: "#f88706ff", fontWeight: "bold" }}>{row.bank}</TableCell>
              <TableCell align="center" style={{ color: "#f80606ff", fontWeight: "bold" }}>{`${row.amount_withdrawn?.toLocaleString()} تومان`}</TableCell>
              <TableCell align="center" style={{ color: "#a306f8ff", fontWeight: "bold" }}>{`${row.transfer_amount?.toLocaleString()} تومان`}</TableCell>
              <TableCell align="center" style={{ color: "#0687f8ff", fontWeight: "bold" }}>{`${row.total_out?.toLocaleString()} تومان`}</TableCell>
              <TableCell align="center" style={{ color: "#046a5bff", fontWeight: "bold" }}>{row.transfer_bank}</TableCell>
              <TableCell align="center" style={{ color: "#f806e8ff", fontWeight: "bold" }}>{`${row.this_month_balance?.toLocaleString()} تومان`}</TableCell>
              <TableCell align="center" style={{ color: "#9706f8ff", fontWeight: "bold" }}>{`${row.total_balance?.toLocaleString()} تومان`}</TableCell>
              <TableCell align="center" style={{ color: "#4e4b4eff", fontWeight: "bold" }}>{row.withdrawal_date}</TableCell>
              <TableCell align="center" style={{ color: "#0d0810ff", fontWeight: "bold" }}>{row.description}</TableCell>
              <TableCell align="center" style={{ color: row.remaining_balance < 0 ? "red" : "green", fontWeight: "bold" }}>{`${row.remaining_balance?.toLocaleString()} تومان`}</TableCell>
              <TableCell>
                <IconButton onClick={() => onEdit && onEdit(row)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => onDelete && onDelete(row.id)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={columns.length} align="center">داده‌ای وجود ندارد</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  
  );
};

export default MonthlyWithdrawalTable;
