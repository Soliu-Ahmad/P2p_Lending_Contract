// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {IERC20} from "./IMPX.sol";


contract P2PLending {

    IERC20 public token;
    uint256 public loanCounter; 
    address public owner;

    struct Loan {
        uint256 loanId;
        uint256 amount;
        uint256 interestRate;    
        uint256 dueDate;         
        uint256 lateFeeRate;     
        address lender;
        address borrower;
        bool isRepaid;
    }

    mapping(uint256 => Loan) public loans;

   
    constructor(IERC20 _token) {
        token = _token;
        owner = msg.sender;
    }


    event LoanCreated(uint256 loanId, address indexed lender, uint256 amount, uint256 interestRate, uint256 dueDate);
    event LoanAccepted(uint256 loanId, address indexed borrower);
    event LoanRepaid(uint256 loanId, uint256 amount);
    event LateFeePaid(uint256 loanId, uint256 lateFee);


      modifier loanExists(uint256 loanId) {
        require(msg.sender != address(0), "Zero address not allowed");
        require(loans[loanId].loanId == loanId, "Loan does not exist");
        _;
    }

 
     function createLoan(uint256 _amount, uint256 _interestRate, uint256 _dueDate, uint256 _lateFeeRate) external {
        require(msg.sender != address(0), "Zero address not allowed");
        address depositor = msg.sender;
        require(token.transferFrom(depositor, address(this), _amount), "Token transfer failed");

        loanCounter++;
    
        Loan memory newloan;

        newloan.loanId = loanCounter;
        newloan.amount = _amount;
        newloan.interestRate = _interestRate;
        newloan.dueDate = _dueDate;
        newloan.lateFeeRate = _lateFeeRate;
        newloan.borrower = address(0);
        newloan.isRepaid = false;
        newloan.lender = msg.sender;
     

        loans[loanCounter] = newloan;

        emit LoanCreated(loanCounter, msg.sender, _amount, _interestRate, _dueDate);
    }



    function acceptLoan(uint256 loanId) external loanExists(loanId) {
        Loan storage loan = loans[loanId];
        require(loan.borrower == address(0), "Loan already accepted");
        require(loan.lender != msg.sender, "Lender cannot accept own loan");

        loan.borrower = msg.sender;
        require(token.transfer(msg.sender, loan.amount), "Token transfer to borrower failed");

        emit LoanAccepted(loanId, msg.sender);
    }


    function repayLoan(uint256 loanId) external loanExists(loanId) {
        Loan storage loan = loans[loanId];
        require(msg.sender == loan.borrower, "Only borrower can repay");
        require(!loan.isRepaid, "Loan already repaid");

        uint256 repaymentAmount = loan.amount + (loan.amount * loan.interestRate / 100);

        if (block.timestamp > loan.dueDate) {
            uint256 lateFee = loan.amount * loan.lateFeeRate / 100;
            repaymentAmount += lateFee;
            emit LateFeePaid(loanId, lateFee);
        }

        address repayer = msg.sender;
        require(token.transferFrom(repayer, loan.lender, repaymentAmount), "Token transfer for repayment failed");
        loan.isRepaid = true;

        emit LoanRepaid(loanId, repaymentAmount);
    }


    function getLoanDetails(uint256 loanId) external view loanExists(loanId) returns (
        uint256, uint256, uint256, uint256, address, address, bool
    ) {
        Loan memory loan = loans[loanId];
        return (
            loan.amount,
            loan.interestRate,
            loan.dueDate,
            loan.lateFeeRate,
            loan.lender,
            loan.borrower,
            loan.isRepaid
        );
    }
}

