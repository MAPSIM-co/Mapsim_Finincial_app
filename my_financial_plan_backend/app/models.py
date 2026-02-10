# app/models.py
# app/models.py
from sqlalchemy import Column, Integer, String, Text, BigInteger, ForeignKey, Date,Enum,DateTime,Boolean
from sqlalchemy.orm import relationship
from app.db import Base
from sqlalchemy.sql import func
# ---------------- بانک ----------------
class BankAccount(Base):
    __tablename__ = "bank_accounts"

    id = Column(Integer, primary_key=True, index=True)
    bank_name = Column(String(100), nullable=False)
    account_type = Column(String(100), nullable=True)
    branch_code = Column(String(50), nullable=True)
    account_number = Column(String(50), nullable=True)
    sheba = Column(String(34), nullable=True)
    card_number = Column(String(19), nullable=True)
    expire_date = Column(String(10), nullable=True)
    cvv2 = Column(String(4), nullable=True)  # توصیه: در production این را ذخیره نکن
    description = Column(Text, nullable=True)
    color = Column(String(7), nullable=True, default="#000000")

# ---------------- Type1 تا Type5 ----------------
# تمام Typeها ستون bank را به صورت نام بانک (string) دارند

class Type1(Base):
    __tablename__ = "type1"

    id = Column(Integer, primary_key=True, index=True)
    topic = Column(String(255), nullable=False)
    allocated_budget = Column(BigInteger, nullable=False)
    bank = Column(String(255), nullable=True)  # نام بانک
    description = Column(Text, nullable=True)

class Type2(Base):
    __tablename__ = "type2"

    id = Column(Integer, primary_key=True, index=True)
    topic = Column(String(255), nullable=False)
    allocated_budget = Column(BigInteger, nullable=False)
    bank = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)

class Type3(Base):
    __tablename__ = "type3"

    id = Column(Integer, primary_key=True, index=True)
    topic = Column(String(255), nullable=False)
    allocated_budget = Column(BigInteger, nullable=False)
    bank = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)

class Type4(Base):
    __tablename__ = "type4"

    id = Column(Integer, primary_key=True, index=True)
    topic = Column(String(255), nullable=False)
    allocated_budget = Column(BigInteger, nullable=False)
    bank = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)

class Type5(Base):
    __tablename__ = "type5"

    id = Column(Integer, primary_key=True, index=True)
    topic = Column(String(255), nullable=False)
    allocated_budget = Column(BigInteger, nullable=False)
    bank = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)

# -------------------- Investment Funds --------------------
class InvestmentFund(Base):
    __tablename__ = "investment_funds"

    id = Column(Integer, primary_key=True, index=True)
    fund_name = Column(String(255), nullable=False)
    fund_type = Column(String(100), nullable=False)  # ثابت، سهامی، طلا، مختلط، ETF, ...
    payout_period = Column(String(50), nullable=False)  # ماهیانه، سه‌ماهه، شش‌ماهه...
    payout_day = Column(String(50), nullable=False)      # مثل 30 ماه، 15 ماه، اول هر ماه...
    description = Column(Text, nullable=True)

    # ارتباط با active investments
    active_funds = relationship("ActiveInvestment", back_populates="fund_rel")



# -------------------- Active Investments --------------------
class ActiveInvestment(Base):
    __tablename__ = "active_investments"

    id = Column(Integer, primary_key=True, index=True)

    fund_id = Column(Integer, ForeignKey("investment_funds.id"), nullable=False)
    month = Column(String(100), nullable=False)   # مثال: آذر 1404

    amount_at_fund = Column(BigInteger, nullable=False)  # مبلغ نزد صندوق
    units_left = Column(Integer, nullable=False)  # تعداد واحد مانده
    units_sold = Column(Integer, nullable=True, default=0)
    profit_per_unit = Column(BigInteger, nullable=True)
    saved_value = Column(BigInteger, nullable=True)
    calculated_profit = Column(BigInteger, nullable=True, default=0)  # سود محاسبه‌شده

    profit_received_date = Column(String(20), nullable=True)
    sell_date = Column(String(20), nullable=True)

    description = Column(Text, nullable=True)

    fund_rel = relationship("InvestmentFund", back_populates="active_funds")


# -------------------- Monthly Deposits (وضعیت واریز ماهیانه) --------------------
class MonthlyDeposit(Base):
    __tablename__ = "monthly_deposits"

    id = Column(Integer, primary_key=True, index=True)

    type_name = Column(String(100), nullable=True)  # نوع (مثلاً type1, type2 ... یا نام دلخواه)
    topic = Column(String(255), nullable=False)     # عنوان
    items = Column(Text, nullable=True)             # موارد (توضیحات کوتاه/موارد مرتبط)

    allocated_budget = Column(BigInteger, nullable=True)  # بودجه اختصاص یافته
    bank = Column(Integer, ForeignKey("bank_accounts.id"), nullable=True)  # ارجاع به جدول بانک

    amount_deposited = Column(BigInteger, nullable=True)  # مبلغ واریز شده
    extra_payment = Column(BigInteger, nullable=True)     # اضافه پرداخت
    shortfall = Column(BigInteger, nullable=True)         # کسری

    deposit_date = Column(String(20), nullable=True)  # تاریخ واریز (فرمت دلخواه: YYYY-MM-DD یا رشته)
    description = Column(Text, nullable=True)         # توضیحات

    balance_before = Column(BigInteger, nullable=True)  # موجودی قبل از واریز
    balance_after = Column(BigInteger, nullable=True)   # موجودی بعد از واریز

    # اگر نیاز به رابطه با BankAccount در آینده بود می‌توان اضافه کرد
    # bank_rel = relationship("BankAccount")

    # -------------------- Monthly Withdrawals (وضعیت برداشت ماهیانه) --------------------
class MonthlyWithdrawal(Base):
    __tablename__ = "monthly_withdrawals"

    id = Column(Integer, primary_key=True, index=True)
    type_name = Column(String(100), nullable=True)  # نوع
    topic = Column(String(255), nullable=False)     # عنوان
    items = Column(Text, nullable=True)             # موارد
    allocated_budget = Column(BigInteger, nullable=True)  # بودجه اختصاص یافته
    bank = Column(String(255), nullable=True)       # بانک اختصاص یافته (نام بانک)
    amount_withdrawn = Column(BigInteger, nullable=True)  # مبلغ برداشت شده
    transfer_amount = Column(BigInteger, nullable=True)   # مبلغ انتقالی
    total_out = Column(BigInteger, nullable=True)         # مجموع انتقالی و برداشت
    transfer_bank = Column(String(255), nullable=True)    # بانک مقصد انتقال
    this_month_balance = Column(BigInteger, nullable=True) # موجودی این ماه
    total_balance = Column(BigInteger, nullable=True)      # موجودی کل
    withdrawal_date = Column(String(20), nullable=True)    # تاریخ برداشت
    description = Column(Text, nullable=True)              # توضیحات برداشت
    remaining_balance = Column(BigInteger, nullable=True)  # مبلغ مانده در حساب


    # app/models/graduation.py



class Graduation(Base):
    __tablename__ = "Graduation"

    id = Column(Integer, primary_key=True, index=True)

    # اتصال داینامیک به Type
    type_name = Column(String(20), nullable=False)
    item_id = Column(Integer, nullable=False)
    items = Column(String(50), nullable=False)

    # اطلاعات تراکنش
    topic = Column(String(255), nullable=True, default="")
    allocated_budget = Column(BigInteger, nullable=False, default=0)
    bank = Column(String(100), nullable=True, default="")
    transaction_type = Column(Enum("deposit", "withdraw"), nullable=False)
    amount = Column(BigInteger, nullable=False, default=0)
    withdrawn_amount = Column(BigInteger, nullable=False, default=0)
    balance_before = Column(BigInteger, nullable=False, default=0)
    balance_after = Column(BigInteger, nullable=False, default=0)
    saved_amount = Column(BigInteger, nullable=False, default=0)

    # تاریخ و توضیحات
    transaction_date = Column(Date, nullable=False)
    description = Column(Text, nullable=True)




# app/models.py


class Class(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())




# -------------------- TuitionTypes --------------------

class TuitionTypes(Base):
    __tablename__ = "tuition_types"

    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, index=True, nullable=False)
    type_name = Column(String(50), index=True, nullable=False)
    type_of_class = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    amount = Column(BigInteger, default=0)
    applicable_for = Column(String(50), nullable=True)
    type_of_payment = Column(String(50), default="cash")
    start_date = Column(String(50), nullable=True)
    end_date = Column(String(50), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )



# -------------------- checheques --------------------

class Cheques(Base):
    __tablename__ = "cheques"

    id = Column(Integer, primary_key=True, index=True)
    type_name = Column(String(50), index=True, nullable=False)
    item_id = Column(Integer, index=True, nullable=True)
    items = Column(String(50), nullable=False)
    serial_number = Column(String(50), nullable=True)
    bank = Column(Integer, index=True, nullable=False)
    amount = Column(BigInteger, default=0)
    pay_to = Column(String(100), nullable=False)
    issue_date = Column(String(20), nullable=False)
    due_date = Column(String(20), nullable=False)
    cheque_type = Column(Enum("دریافتی", "پرداختی", name="cheque_type"), nullable=False, default="دریافتی")
    status = Column(String(50), nullable=True, default="در انتظار")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())




# -------------------- persons --------------------
class Person(Base):
    __tablename__ = "persons"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    full_name = Column(String(150), nullable=False)  # varchar(150)
    phone = Column(String(20), nullable=True, default=None)  # varchar(20)
    national_code = Column(String(20), nullable=True, default=None)  # varchar(20)
    description = Column(Text, nullable=True)  # text
    is_active = Column(Boolean, nullable=True, default=True)  # tinyint(1)
    created_at = Column(DateTime, nullable=True, server_default=func.current_timestamp())
    updated_at = Column(DateTime, nullable=True, server_default=func.current_timestamp(), onupdate=func.current_timestamp())





class DebtorCreditor(Base):
    __tablename__ = "debtor_creditor"

    id = Column(Integer, primary_key=True, index=True)
    person_id = Column(Integer, ForeignKey("persons.id", ondelete="CASCADE"), nullable=False)
    type_name = Column(String(50), nullable=False)
    items = Column(String(100), nullable=False)
    borrow_date = Column(Date, nullable=False)
    return_date = Column(Date, nullable=True)
    amount = Column(BigInteger, default=0)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    person = relationship("Person", backref="debtor_creditors")