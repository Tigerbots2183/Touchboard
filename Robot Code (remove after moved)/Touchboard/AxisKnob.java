// Copyright (c) FIRST and other WPILib contributors.
// Open Source Software; you can modify and/or share it under the terms of
// the WPILib BSD license file in the root directory of this project.

package frc.robot.subsystems.Touchboard;

import edu.wpi.first.wpilibj2.command.SubsystemBase;

import edu.wpi.first.networktables.NetworkTable;
import edu.wpi.first.networktables.NetworkTableInstance;
import edu.wpi.first.networktables.DoublePublisher;
import edu.wpi.first.networktables.DoubleSubscriber;
import edu.wpi.first.wpilibj2.command.Command;
import java.util.function.Supplier;
import edu.wpi.first.wpilibj2.command.Commands;

public class AxisKnob extends SubsystemBase {
  /** Creates a new AxisKnob. */
  public double value = 0;
  double prev = 0;
  String topic;
  
  DoubleSubscriber dataSubscriber;
  DoublePublisher dataPublisher;

  Supplier<Command> passedCommand = () -> Commands.none();

  public AxisKnob(String topic) {
    NetworkTableInstance inst = NetworkTableInstance.getDefault();
    NetworkTable datatable = inst.getTable("touchboard");

    dataPublisher = datatable.getDoubleTopic(topic).publish();
    dataSubscriber = datatable.getDoubleTopic(topic).subscribe(0);
    
    this.topic = topic;
  }

  public void setCommand(Supplier<Command> newCom) {
    passedCommand = newCom;
  }

  public double getValue() {
    return dataSubscriber.get();
  }

  @Override
  public void periodic() {
    value = dataSubscriber.get();

    if (value != prev) {
      prev = value;
      passedCommand.get().schedule();

    }
    // This method will be called once per scheduler run
  }
}
