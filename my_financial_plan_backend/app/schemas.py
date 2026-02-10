# app/schemas.py

from pydantic import BaseModel, Field
from typing import Optional,Literal
from datetime import date , datetime

# ---------------- بانک ----------------
class BankAccountBase(BaseModel):
    bank_name: Optional[str] = Field(None, max_length=100)
    account_type: Optional[str] = Field(None, max_length=100)
    branch_code: Optional[str] = Field(None, max_length=50)
    account_number: Optional[str] = Field(None, max_length=50)
    sheba: Optional[str] = Field(None, max_length=34)
    card_number: Optional[str] = Field(None, max_length=19)
    expire_date: Optional[str] = Field(None, max_length=10)
    cvv2: Optional[str] = Field(None, max_length=4)
    description: Optional[str] = None
    color: Optional[str] = "#000000"  # رنگ بانک

class BankAccountCreate(BankAccountBase):
    bank_name: str
    account_type: str

class BankAccountUpdate(BankAccountBase):
    pass

class BankAccountOut(BankAccountBase):
    id: int

    class Config:
        orm_mode = True

# ---------------- Type1 تا Type5 ----------------
class TypeBase(BaseModel):
    topic: str = Field(..., max_length=255)
    allocated_budget: int
    bank: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None

class Type1Create(TypeBase):
    pass

class Type1Update(TypeBase):
    pass

class Type1Out(TypeBase):
    id: int
    class Config:
        orm_mode = True

class Type2Create(TypeBase):
    pass

class Type2Update(TypeBase):
    pass

class Type2Out(TypeBase):
    id: int
    class Config:
        orm_mode = True

class Type3Create(TypeBase):
    pass

class Type3Update(TypeBase):
    pass

class Type3Out(TypeBase):
    id: int
    class Config:
        orm_mode = True

class Type4Create(TypeBase):
    pass

class Type4Update(TypeBase):
    pass

class Type4Out(TypeBase):
    id: int
    class Config:
        orm_mode = True

class Type5Create(TypeBase):
    pass

class Type5Update(TypeBase):
    pass

class Type5Out(TypeBase):
    id: int
    class Config:
        orm_mode = True

# ========================
#   Investment Funds
# ========================

class InvestmentFundBase(BaseModel):
    fund_name: str
    fund_type: str
    payout_period: str
    payout_day: str
    description: Optional[str] = None

class InvestmentFundCreate(InvestmentFundBase):
    pass

class InvestmentFundUpdate(BaseModel):
    fund_name: Optional[str] = None
    fund_type: Optional[str] = None
    payout_period: Optional[str] = None
    payout_day: Optional[str] = None
    description: Optional[str] = None

class InvestmentFundOut(InvestmentFundBase):
    id: int
    class Config:
        from_attributes = True


# ========================
#   Active Investments
# ========================

class ActiveInvestmentBase(BaseModel):
    fund_id: int
    month: str
    amount_at_fund: int
    units_left: int
    units_sold: Optional[int] = 0
    profit_per_unit: Optional[int] = None
    saved_value: Optional[int] = None
    calculated_profit: Optional[int] = 0  # سود محاسبه‌شده
    profit_received_date: Optional[str] = None
    sell_date: Optional[str] = None
    description: Optional[str] = None

class ActiveInvestmentCreate(ActiveInvestmentBase):
    pass

class ActiveInvestmentUpdate(BaseModel):
    fund_id: Optional[int] = None
    month: Optional[str] = None
    amount_at_fund: Optional[int] = None
    units_left: Optional[int] = None
    units_sold: Optional[int] = None
    profit_per_unit: Optional[int] = None
    saved_value: Optional[int] = None
    calculated_profit: Optional[int] = None
    profit_received_date: Optional[str] = None
    sell_date: Optional[str] = None
    description: Optional[str] = None

class ActiveInvestmentOut(ActiveInvestmentBase):
    id: int
    fund_name: Optional[str] = None   # JOIN output
    class Config:
        from_attributes = True


# -------------------- Monthly Deposits Schemas --------------------
class MonthlyDepositBase(BaseModel):
    type_name: Optional[str] = None
    topic: str = Field(..., max_length=255)
    items: Optional[str] = None
    allocated_budget: Optional[int] = None
    bank: Optional[str] = None
    amount_deposited: Optional[int] = None
    extra_payment: Optional[int] = None
    shortfall: Optional[int] = None
    deposit_date: Optional[str] = None
    description: Optional[str] = None
    balance_before: Optional[int] = None
    balance_after: Optional[int] = None

class MonthlyDepositCreate(MonthlyDepositBase):
    pass

class MonthlyDepositUpdate(BaseModel):
    type_name: Optional[str] = None
    topic: Optional[str] = None
    items: Optional[str] = None
    allocated_budget: Optional[int] = None
    bank: Optional[str] = None
    amount_deposited: Optional[int] = None
    extra_payment: Optional[int] = None
    shortfall: Optional[int] = None
    deposit_date: Optional[str] = None
    description: Optional[str] = None
    balance_before: Optional[int] = None
    balance_after: Optional[int] = None

class MonthlyDepositOut(MonthlyDepositBase):
    id: int
    class Config:
        from_attributes = True

# -------------------- Monthly Withdrawals Schemas --------------------
class MonthlyWithdrawalBase(BaseModel):
    type_name: Optional[str] = None
    topic: str = Field(..., max_length=255)
    items: Optional[str] = None
    allocated_budget: Optional[int] = None
    bank: Optional[str] = None
    amount_withdrawn: Optional[int] = None
    transfer_amount: Optional[int] = None
    total_out: Optional[int] = None
    transfer_bank: Optional[str] = None
    this_month_balance: Optional[int] = None
    total_balance: Optional[int] = None
    withdrawal_date: Optional[str] = None
    description: Optional[str] = None
    remaining_balance: Optional[int] = None

class MonthlyWithdrawalCreate(MonthlyWithdrawalBase):
    pass

class MonthlyWithdrawalUpdate(BaseModel):
    type_name: Optional[str] = None
    topic: Optional[str] = None
    items: Optional[str] = None
    allocated_budget: Optional[int] = None
    bank: Optional[str] = None
    amount_withdrawn: Optional[int] = None
    transfer_amount: Optional[int] = None
    total_out: Optional[int] = None
    transfer_bank: Optional[str] = None
    this_month_balance: Optional[int] = None
    total_balance: Optional[int] = None
    withdrawal_date: Optional[str] = None
    description: Optional[str] = None
    remaining_balance: Optional[int] = None

class MonthlyWithdrawalOut(MonthlyWithdrawalBase):
    id: int
    class Config:
        from_attributes = True


# -------------------- Graduation Schemas --------------------



# ---------- Base ----------
class GraduationBase(BaseModel):
    type_name: str
    item_id: int
    items: str
    topic: Optional[str] = ""
    allocated_budget: Optional[int] = 0
    bank: Optional[str] = ""
    transaction_type: Literal["deposit", "withdraw"]
    amount: int
    withdrawn_amount: Optional[int] = 0
    balance_before: int
    balance_after: int
    saved_amount: Optional[int] = 0
    transaction_date: date
    description: Optional[str] = None


# ---------- Create ----------
class GraduationCreate(GraduationBase):
    pass


# ---------- Update ----------
class GraduationUpdate(BaseModel):
    transaction_type: Optional[Literal["deposit", "withdraw"]] = None
    amount: Optional[int] = None
    transaction_date: Optional[date] = None
    description: Optional[str] = None


# ---------- Out ----------
class GraduationOut(GraduationBase):
    id: int

    class Config:
        from_attributes = True

class LastBalanceOut(BaseModel):
    saved_amount: int



# app/schemas.py


class ClassBase(BaseModel):
    name: str
    description: Optional[str] = None

class ClassCreate(ClassBase):
    pass

class ClassUpdate(ClassBase):
    pass

class ClassOut(ClassBase):
    id: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True






# app/schemas.py


class TuitionTypesBase(BaseModel):
    class_id: int
    type_name: str
    type_of_class: str
    description: Optional[str] = None
    amount: Optional[int] = 0
    applicable_for: Optional[str] = None
    type_of_payment: Optional[str] = "cash"
    start_date: Optional[str] = None
    end_date: Optional[str] = None

    

class TuitionTypesCreate(TuitionTypesBase):
    pass

class TuitionTypesUpdate(BaseModel):
    class_id: Optional[int]
    type_name: Optional[str]
    type_of_class: Optional[str]
    description: Optional[str]
    amount: Optional[int]
    applicable_for: Optional[str]
    type_of_payment: Optional[str]
    start_date: Optional[str]
    end_date: Optional[str]

class TuitionTypesOut(TuitionTypesBase):
    id: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True









class ChequeBase(BaseModel):
    type_name: str
    item_id: Optional[int] = None   
    items: str
    serial_number: Optional[str] = None
    bank: int
    amount: Optional[int] = 0
    pay_to: str
    issue_date: str  # YYYY-MM-DD
    due_date: str    # YYYY-MM-DD
    cheque_type: Optional[str] = "دریافتی"
    status: Optional[str] = "در انتظار"

class ChequeCreate(ChequeBase):
    pass

class ChequeUpdate(BaseModel):
    type_name: Optional[str]
    item_id: Optional[int]
    items: Optional[str]
    serial_number: Optional[str]
    bank: Optional[int]
    amount: Optional[int]
    pay_to: Optional[str]
    issue_date: Optional[str]
    due_date: Optional[str]
    cheque_type: Optional[str]
    status: Optional[str]

class ChequeOut(ChequeBase):
    id: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True




class PersonBase(BaseModel):
    full_name: str
    phone: Optional[str] = None
    national_code: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = True

class PersonCreate(PersonBase):
    pass

class PersonUpdate(PersonBase):
    pass

class PersonOut(PersonBase):
    id: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True






class DebtorCreditorBase(BaseModel):
    person_id: int
    type_name: str
    items: str
    borrow_date: date
    return_date: Optional[date] = None
    amount: int = 0
    description: Optional[str] = None

class DebtorCreditorCreate(DebtorCreditorBase):
    pass

class DebtorCreditorUpdate(BaseModel):
    type_name: Optional[str] = None
    items: Optional[str] = None
    borrow_date: Optional[date] = None
    return_date: Optional[date] = None
    amount: Optional[int] = None
    description: Optional[str] = None

class DebtorCreditorOut(DebtorCreditorBase):
    id: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True
