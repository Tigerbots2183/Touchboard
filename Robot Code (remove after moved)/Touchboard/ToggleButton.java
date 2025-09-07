// Copyright (c) FIRST and other WPILib contributors.
// Open Source Software; you can modify and/or share it under the terms of
// the WPILib BSD license file in the root directory of this project.

package frc.robot.subsystems.Touchboard;

import java.util.function.Supplier;

import edu.wpi.first.networktables.BooleanPublisher;
import edu.wpi.first.networktables.BooleanSubscriber;
import edu.wpi.first.networktables.NetworkTable;
import edu.wpi.first.networktables.NetworkTableInstance;
import edu.wpi.first.wpilibj2.command.Command;
import edu.wpi.first.wpilibj2.command.Commands;
import edu.wpi.first.wpilibj2.command.SubsystemBase;

public class ToggleButton extends SubsystemBase {


  final BooleanSubscriber dataSubscriber;
  final BooleanPublisher dataPublisher;

  String buttonName;
  Command executed;
  Supplier<Command> executedSupplied;
  Command currentlySuppliedCommand = Commands.none();

  boolean isSupplier;

  public ToggleButton(String buttonName, Command executed) {
    this.executed = executed;
    this.isSupplier = false;
    NetworkTableInstance inst = NetworkTableInstance.getDefault();
    NetworkTable datatable = inst.getTable("touchboard");

    dataPublisher = datatable.getBooleanTopic(buttonName).publish();
    dataSubscriber = datatable.getBooleanTopic(buttonName).subscribe(false);

  }

  public ToggleButton(String buttonName, Supplier<Command> executed) {
    this.isSupplier = true;
    this.executedSupplied = executed;

    NetworkTableInstance inst = NetworkTableInstance.getDefault();
    NetworkTable datatable = inst.getTable("touchboard");

    dataPublisher = datatable.getBooleanTopic(buttonName).publish();
    dataSubscriber = datatable.getBooleanTopic(buttonName).subscribe(false);

  }

  public boolean getValue() {
    return dataSubscriber.get();
  }

  public void periodic() {
    boolean value = dataSubscriber.get();

    if (value) {
      if (isSupplier) {
        currentlySuppliedCommand = executedSupplied.get();
        currentlySuppliedCommand.schedule();

      } else {
        executed.schedule();

      }

    } else {
      if (isSupplier) {
        currentlySuppliedCommand.cancel();
      } else {
        executed.cancel();

      }
    }
  }

  public void close() {
    dataSubscriber.close();
  }
}
