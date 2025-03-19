/* eslint-disable prettier/prettier */
import { BleManager } from 'react-native-ble-plx';

export default class BluetoothService {
  static bleMngr = null;

  static getInstance() {
    if (BluetoothService.bleMngr == null) {
      BluetoothService.bleMngr = new BleManager();
    }

    return this.bleMngr;
  }

  static resetInstance() {
    if (BluetoothService.bleMngr !== null) {
      this.bleMngr.destroy();
      this.bleMngr = null;
    }
  }

  static enableBluetooth() {
    this.getInstance()
      .enable()
      .then(() => {
        console.log('The bluetooth is already enabled or the user confirm');
      })
      .catch((error) => {
        console.log('The user refuse to enable bluetooth', error);
      });
  }

  static disableBluetooth() {
    this.getInstance()
      .disable()
      .then(() => {
        console.log('The bluetooth is already disable or the user confirm');
      })
      .catch((error) => {
        console.log('The user refuse to enable bluetooth', error);
      });
  }
}
