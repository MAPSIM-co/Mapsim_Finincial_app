import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const BankAccountTable = ({ accounts, onEdit, onDelete }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell style={{ color: "Black", fontWeight: "bold" }}>نام بانک</TableCell>
            <TableCell style={{ color: "Black", fontWeight: "bold" }}>نوع حساب</TableCell>
            <TableCell style={{ color: "Black", fontWeight: "bold" }}>کد شعبه</TableCell>
            <TableCell style={{ color: "Black", fontWeight: "bold" }}>شماره حساب</TableCell>
            <TableCell style={{ color: "Black", fontWeight: "bold" }}>شماره شبا</TableCell>
            <TableCell style={{ color: "Black", fontWeight: "bold" }}>شماره کارت</TableCell>
            <TableCell style={{ color: "Black", fontWeight: "bold" }}>تاریخ انقضا</TableCell>
            <TableCell style={{ color: "Black", fontWeight: "bold" }}>CVV2</TableCell> 
            <TableCell style={{ color: "Black", fontWeight: "bold" }}>توضیحات</TableCell>
            <TableCell style={{ color: "Black", fontWeight: "bold" }}>رنگ بانک</TableCell>
            <TableCell style={{ color: "Black", fontWeight: "bold" }}>عملیات</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {accounts.map((acc) => (
            <TableRow key={acc.id}>
              <TableCell style={{ color: "darkblue", fontWeight: "bold" }}>{acc.bank_name}</TableCell>
              <TableCell style={{ color: "Black", fontWeight: "bold" }}>{acc.account_type}</TableCell>
              <TableCell style={{ color: "Black", fontWeight: "bold" }}>{acc.branch_code}</TableCell>
               <TableCell style={{ color: "darkviolet", fontWeight: "bold" }}>{acc.account_number}</TableCell>
              <TableCell style={{ color: "darkRed", fontWeight: "bold" }}>{acc.sheba}</TableCell>
              <TableCell style={{ color: "Green", fontWeight: "bold" }}>{acc.card_number}</TableCell>
              <TableCell style={{ color: "Black", fontWeight: "bold" }}>{acc.expire_date}</TableCell>
              <TableCell style={{ color: "Red", fontWeight: "bold" }}>{acc.cvv2}</TableCell>
              <TableCell style={{ color: "Black", fontWeight: "bold" }}>{acc.description}</TableCell>
              
              <TableCell style={{ color: acc.color || "black", fontWeight: "bold" }}>
                {acc.bank_name}
              </TableCell>

              <TableCell>
                <IconButton onClick={() => onEdit(acc)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => onDelete(acc.id)}>
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

export default BankAccountTable;