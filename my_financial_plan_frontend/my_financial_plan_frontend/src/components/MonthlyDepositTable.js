import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const MonthlyDepositTable = ({ data, onEdit, onDelete }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>شناسه</TableCell>
            <TableCell  align="center" style={{ color: "#030303ff", fontWeight: "bold" }}>نوع</TableCell>
            <TableCell  align="center" style={{ color: "#030303ff", fontWeight: "bold" }}>عنوان</TableCell>
            <TableCell  align="center" style={{ color: "#030303ff", fontWeight: "bold" }}>موضوع</TableCell>
            <TableCell  align="center" style={{ color: "#030303ff", fontWeight: "bold" }}>بودجه اختصاص یافته</TableCell>
            <TableCell  align="center" style={{ color: "#030303ff", fontWeight: "bold" }}>بانک</TableCell>
            <TableCell  align="center" style={{ color: "#030303ff", fontWeight: "bold" }}>مبلغ واریز شده</TableCell>
            <TableCell  align="center" style={{ color: "#030303ff", fontWeight: "bold" }}>اضافه پرداخت</TableCell>
            <TableCell  align="center" style={{ color: "#030303ff", fontWeight: "bold" }}>کسری</TableCell>
            <TableCell  align="center" style={{ color: "#030303ff", fontWeight: "bold" }}>تاریخ واریز</TableCell>
            <TableCell  align="center" style={{ color: "#030303ff", fontWeight: "bold" }}>موجودی قبل از واریز</TableCell>
            <TableCell  align="center" style={{ color: "#030303ff", fontWeight: "bold" }}>موجودی بعد از واریز</TableCell>
            <TableCell  align="center" style={{ color: "#030303ff", fontWeight: "bold" }}>عملیات</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {[...data].sort((a, b) => a.id - b.id).map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.id}</TableCell>
              <TableCell align="center" style={{ color: "#030303ff", fontWeight: "bold" }}>{item.type_name}</TableCell>
              <TableCell align="center" style={{ color: "#f80a0aff", fontWeight: "bold" }}>{item.items}</TableCell>
              <TableCell align="center" style={{ color: "Black", fontWeight: "bold" }}>{item.topic}</TableCell>
              <TableCell align="center" style={{ color: "#f86d0aff", fontWeight: "bold" }}>{`${(item.allocated_budget ?? 0).toLocaleString()} تومان`}</TableCell>
              <TableCell align="center" style={{ color: "#030303ff", fontWeight: "bold" }}>{item.bank}</TableCell>
              <TableCell align="center" style={{ color: "#1d55eeff", fontWeight: "bold" }}> {`${(item.amount_deposited ?? 0).toLocaleString()} تومان`}</TableCell>
              <TableCell align="center" style={{ color: "#329507ff", fontWeight: "bold" }}>{`${(item.extra_payment ?? 0).toLocaleString()} تومان`}</TableCell>
              <TableCell align="center" style={{ color: "#f80a0aff", fontWeight: "bold" }}>{`${(item.shortfall ?? 0).toLocaleString()} تومان`}</TableCell>
              <TableCell align="center" style={{ color: "#030303ff", fontWeight: "bold" }}>{item.deposit_date}</TableCell>
              <TableCell align="center" style={{ color: "#aa017dff", fontWeight: "bold" }}>{`${(item.balance_before ?? 0).toLocaleString()} تومان`}</TableCell>
              <TableCell align="center" style={{ color: "#07a5e3ff", fontWeight: "bold" }}>{`${(item.balance_after ?? 0).toLocaleString()} تومان`}</TableCell>
              <TableCell>
                <IconButton onClick={() => onEdit && onEdit(item)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => onDelete && onDelete(item.id)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MonthlyDepositTable;
