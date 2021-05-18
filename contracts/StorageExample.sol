//SPDX-License-Identifier: Unlicense
pragma solidity 0.7.6;

contract StorageExample {
  uint256 value;

  mapping (uint256 => uint256) public valueHistory;
  uint32 public constant VALUE_HISTORY_SIZE = 32;
  uint32 public currentValueHistoryIndex = 0;

  event ValueChanged(address changedBy, string changedTo);

  constructor(uint256 _value) {
    value = _value;
    valueHistory[0] = _value;
  }

  function value() public view returns (uint256 memory) {
    return value;
  }

  function setValue(uint256 _value) public {
    value = _value;
    currentValueHistoryIndex += 1;
    valueHistory[currentValueHistoryIndex] = _value;
    ValueChanged(msg.sender, _value);
  }
}
