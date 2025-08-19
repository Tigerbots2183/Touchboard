// Copyright (c) FIRST and other WPILib contributors.
// Open Source Software; you can modify and/or share it under the terms of
// the WPILib BSD license file in the root directory of this project.

package frc.robot.subsystems.Touchboard;

import edu.wpi.first.wpilibj2.command.SubsystemBase;

import edu.wpi.first.networktables.NetworkTable;
import edu.wpi.first.networktables.NetworkTableInstance;
import edu.wpi.first.networktables.StringPublisher;
import edu.wpi.first.networktables.StringSubscriber;
import edu.wpi.first.wpilibj2.command.Command;
import java.util.function.Supplier;
import edu.wpi.first.wpilibj2.command.Commands;

public class Dropdown extends SubsystemBase {
  public String value = "";
  String prev = "";

  String topic;

  StringSubscriber dataSubscriber;
  StringPublisher dataPublisher;

  Supplier<Command> passedCommand = () -> Commands.none();

  public Dropdown(String topic) {
    NetworkTableInstance inst = NetworkTableInstance.getDefault();
    NetworkTable datatable = inst.getTable("touchboard");

    dataPublisher = datatable.getStringTopic(topic).publish();
    dataSubscriber = datatable.getStringTopic(topic).subscribe("");
    
    this.topic = topic;
  }

  public void setCommand(Supplier<Command> newCom) {
    passedCommand = newCom;
  }

  public String getValue() {
    return dataSubscriber.get();
  }

  @Override
  public void periodic() {
    value = dataSubscriber.get();

    if (!value.equals(prev)) {
      prev = value;
      passedCommand.get().schedule();
    }
    // This method will be called once per scheduler run
  }
}
