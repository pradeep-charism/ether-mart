pragma solidity ^0.5.0;

contract Adoption {
    address[16] public adopters;

    event AdoptEvent(
        address indexed _from,
        uint indexed _id
    );

    event ReleaseEvent(
        address indexed _from,
        uint indexed _id
    );

    function adopt(uint petId) public returns (uint) {
        require(petId >= 0 && petId <= 15);
        adopters[petId] = msg.sender;
        emit AdoptEvent(msg.sender, petId);
        return petId;
    }

    function release(uint petId) public returns (uint) {
        require(petId >= 0 && petId <= 15);
        delete adopters[petId];
        emit AdoptEvent(msg.sender, petId);
        return petId;
    }

    function getAdopters() public view returns (address[16]memory) {
        return adopters;
    }
}

