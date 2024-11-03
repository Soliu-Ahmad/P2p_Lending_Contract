import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
  import { expect } from "chai";
  import hre from "hardhat";
  
  
  
  describe("P2PLending", function () {
   
  
    async function deployP2PLendingFixture() {
      
  
      // const RepayTime = (await time.latest())
  
      const [owner, depositor, borrower] = await hre.ethers.getSigners();
  
      const mpxTokenInstance = await hre.ethers.getContractFactory("MPXToken"); 
        
      const mpxToken = await mpxTokenInstance.deploy(owner);
  
      const p2pLendingInstance = await hre.ethers.getContractFactory("P2PLending");
  
      const p2pLending = await p2pLendingInstance.connect(owner).deploy(mpxToken.getAddress());
  
  
      return { p2pLending, mpxToken, owner, depositor, borrower };
    }
  
    describe("Deployment", function () {
      it("Should deploy the contract successfully", async function () {
        const { p2pLending, mpxToken } = await loadFixture(deployP2PLendingFixture);
  
        expect(await p2pLending.getAddress()).to.not.undefined;
        expect(await mpxToken.getAddress()).to.not.undefined;
      });
  
      it("Should set the right owner", async function () {
        const { p2pLending, mpxToken, owner } = await loadFixture(deployP2PLendingFixture);
  
        expect(await p2pLending.owner()).to.equal(owner.address);
        expect(await mpxToken.owner()).to.equal(owner.address);
      });
  
      it("Should pass mpxToken address correctly", async function () {
        const { p2pLending} = await loadFixture(deployP2PLendingFixture);
  
        expect(await p2pLending.token()).to.not.undefined;
      });
  
  
      });
  
  
    describe("Functions", function () {
      describe("createLoan", function () { 
        it("Should deposit if depositor approve contract to deduct", async function () {
          const { p2pLending, mpxToken, owner, depositor } = await loadFixture(deployP2PLendingFixture);
  
          const interestRate = 12;
          const lateFeeRate = 5;
  
          const depositAmount = await hre.ethers.parseUnits("1000000", 18);
  
          const dueDate = 160
          const loanCounter = 1
  
          await mpxToken.connect(owner).mint(depositor.address, depositAmount)
  
          await mpxToken.connect(depositor).approve(p2pLending.getAddress(), depositAmount)
  
  
          expect(await p2pLending.connect(depositor).createLoan(depositAmount, interestRate, dueDate, lateFeeRate)).to.emit(p2pLending, "LoanCreated").withArgs(loanCounter, depositor.address, depositAmount, interestRate, dueDate)
        });
  
      });
  
      describe("acceptLoan", function () {
        it("Should accept loan if borrower address is valid", async function () {
          const { p2pLending, mpxToken, owner, depositor, borrower } = await loadFixture(
            deployP2PLendingFixture
          );
  
          const interestRate = 12;
          const lateFeeRate = 5;
  
          const depositAmount = await hre.ethers.parseUnits("1000000", 18);
  
          const dueDate = 160
          const loanCounter = 1
  
          await mpxToken.connect(owner).mint(depositor.address, depositAmount)
  
          await mpxToken.connect(depositor).approve(p2pLending.getAddress(), depositAmount)
  
  
          expect(await p2pLending.connect(depositor)
          .createLoan(depositAmount, interestRate, dueDate, lateFeeRate))
          .to.emit(p2pLending, "LoanCreated")
          .withArgs(loanCounter, depositor.address, depositAmount, interestRate, dueDate)
  
  
    
  
          expect(await p2pLending.connect(borrower)
          .acceptLoan(loanCounter)).to.emit(p2pLending, "LoanAccepted")
          .withArgs(loanCounter, borrower.address)
  
        });
      });
  
      describe("repayLoan", function () {
        it("Should be able to pay if  accepted loan and should pay lateFee if dueDate is passed", async function () {
          const { p2pLending, mpxToken, owner, depositor, borrower } = await loadFixture(
            deployP2PLendingFixture
          );
  
          const interestRate = 12;
          const lateFeeRate = 5;
          const mintAmountToBorrower =  await hre.ethers.parseUnits("1000000000000", 18);
  
          const depositAmount = await hre.ethers.parseUnits("1000000", 18);
  
          const dueDate = 160
          const loanCounter = 1
  
          await mpxToken.connect(owner).mint(depositor.address, depositAmount)
  
          await mpxToken.connect(depositor).approve(p2pLending.getAddress(), depositAmount)
  
  
          expect(await p2pLending.connect(depositor)
          .createLoan(depositAmount, interestRate, dueDate, lateFeeRate))
          .to.emit(p2pLending, "LoanCreated")
          .withArgs(loanCounter, depositor.address, depositAmount, interestRate, dueDate)
  
  
    
  
          expect(await p2pLending.connect(borrower)
          .acceptLoan(loanCounter)).to.emit(p2pLending, "LoanAccepted")
          .withArgs(loanCounter, borrower.address)
  
  
          await mpxToken.connect(owner).mint(borrower.address, mintAmountToBorrower)
  
          await mpxToken.connect(borrower).approve(p2pLending.getAddress(), mintAmountToBorrower)
  
          expect(await p2pLending.connect(borrower).repayLoan(loanCounter)).emit(p2pLending, "LoanRepaid").withArgs(loanCounter, anyValue)
  
         
        });
      });
  
      describe("getLoanDetails", function () { 
        it("Should deposit if depositor approve contract to deduct", async function () {
          const { p2pLending, mpxToken, owner, depositor } = await loadFixture(deployP2PLendingFixture);
  
          const interestRate = 12;
          const lateFeeRate = 5;
  
          const depositAmount = await hre.ethers.parseUnits("1000000", 18);
  
          const dueDate = 160
          const loanCounter = 1
  
          await mpxToken.connect(owner).mint(depositor.address, depositAmount)
  
          await mpxToken.connect(depositor).approve(p2pLending.getAddress(), depositAmount)
  
  
          expect(await p2pLending.connect(depositor).createLoan(depositAmount, interestRate, dueDate, lateFeeRate)).to.emit(p2pLending, "LoanCreated").withArgs(loanCounter, depositor.address, depositAmount, interestRate, dueDate)
  
           expect(await p2pLending.getLoanDetails(loanCounter)).to.not.undefined;
        });
      });
    });
  });