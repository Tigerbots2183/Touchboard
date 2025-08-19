// Copyright (c) FIRST and other WPILib contributors.
// Open Source Software; you can modify and/or share it under the terms of
// the WPILib BSD license file in the root directory of this project.

package frc.robot.subsystems.Touchboard;

import edu.wpi.first.wpilibj2.command.Command;
import edu.wpi.first.wpilibj2.command.Commands;
import edu.wpi.first.wpilibj2.command.SubsystemBase;

import edu.wpi.first.networktables.*;
import java.util.function.Supplier;

public class OneShotButton extends SubsystemBase {

  final BooleanSubscriber dataSubscriber;
  final BooleanPublisher dataPublisher;
  
  String buttonName;
  boolean prev = false;

  Supplier<Command> executed = ()->Commands.none();
  
  public OneShotButton(String buttonName, Supplier<Command> executed) {
    NetworkTableInstance inst = NetworkTableInstance.getDefault();
    NetworkTable datatable = inst.getTable("touchboard");

    dataPublisher = datatable.getBooleanTopic(buttonName).publish();
    dataSubscriber = datatable.getBooleanTopic(buttonName).subscribe(false);

    this.executed=executed;
  }

  public boolean getValue() {
    return dataSubscriber.get();
  } 

  public void periodic() {
    boolean value = dataSubscriber.get();

    if (value != prev && value == true) {
      //ensures it dosent accidentally get executed twice from packet loss or network lag
      executed.get().schedule();
      dataPublisher.set(false);
    }
  }

  public void close() {
    dataSubscriber.close();
  }
}
