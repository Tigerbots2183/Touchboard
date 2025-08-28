// Copyright (c) FIRST and other WPILib contributors.
// Open Source Software; you can modify and/or share it under the terms of
// the WPILib BSD license file in the root directory of this project.

package frc.robot.subsystems.Touchboard;

import edu.wpi.first.networktables.*;
import edu.wpi.first.wpilibj2.command.Command;
import edu.wpi.first.wpilibj2.command.Commands;

import java.util.HashMap;
import java.util.Map;
import java.util.function.Supplier;

public class posePlotterUtil {
    private static StringSubscriber string_Sub;
    private static NetworkTableInstance inst = NetworkTableInstance.getDefault(); // may cause issues (hasnt so far)
    private static NetworkTable datatable = inst.getTable("touchboard");
    private static HashMap<String, Supplier<Command>> commandPairs = new HashMap<String,Supplier<Command>>();
    private static String defaultAuto = "NA";

    public static String getAutoString() {
        string_Sub = datatable.getStringTopic("posePlotterFinalString").subscribe(defaultAuto);

        String currentString = string_Sub.get();

        return currentString;

    }

    public static void setFallbackAuto(String defaultValue){
        defaultAuto = defaultValue;
    }

    public static int stringStatus() {
        string_Sub = datatable.getStringTopic("posePlotterFinalString").subscribe("NA");
        String currentString = string_Sub.get();
        if (currentString == "NA") {
            return 404;
        } else if (currentString == "unset") {
            return 204;
        } else {
            return 200;

        }
    }

    public static void addCommandPair(String value, Supplier<Command> newCommand) {
        commandPairs.put(value, newCommand);
        return;
    }

    public static Command getAuto() {

        String startString = posePlotterUtil.getAutoString();

        System.out.println(startString);
        String[] stringArr = startString.split("-");
        Command newAuto = Commands.none();
        Command parralelCmd = Commands.none();
        Command nextCommand = Commands.none();
        Boolean currentParralel = false;

        for (String currentValue : stringArr) {

            if (stringArr.length == 0) {
                System.out.println("No Auto!! Consider turning on fallback if at competition!");
                break;
            }
            nextCommand = Commands.none();

            for (Map.Entry<String, Supplier<Command>> pair : commandPairs.entrySet()) {
                String pairKey = pair.getKey();
                Supplier<Command> pairCommand = pair.getValue();

                if (currentValue.equals(pairKey) || currentValue.equals(pairKey + "+")) {

                    nextCommand = pairCommand.get();
                    break;
                }
            }

            if (nextCommand == Commands.none()) {
                System.out.println(currentValue + " is an undefined command pair!");
            }

            if (currentValue.contains("+")) {
                // If + add to a parralell group
                parralelCmd = parralelCmd.alongWith(nextCommand);
                currentParralel = true;

                continue;
            } else if (currentParralel) {
                // If previous was + then execute this command with last
                parralelCmd = parralelCmd.alongWith(nextCommand);
                newAuto = newAuto.andThen(parralelCmd);
                parralelCmd = Commands.none();
                currentParralel = false;
            } else {
                // Else Sequence Command
                newAuto = newAuto.andThen(nextCommand);
            }
        }
        
        return newAuto;
    }
}
    // HashMap<String, Pose2d> poses = new HashMap<String, Pose2d>();

    // poses.put("A", POSES.REEF_A);
    // poses.put("B", POSES.REEF_B);
    // poses.put("C", POSES.REEF_C);
    // poses.put("D", POSES.REEF_D);
    // poses.put("E", POSES.REEF_E);
    // poses.put("F", POSES.REEF_F);
    // poses.put("G", POSES.REEF_G);
    // poses.put("H", POSES.REEF_H);
    // poses.put("I", POSES.REEF_I);
    // poses.put("J", POSES.REEF_J);
    // poses.put("K", POSES.REEF_K);
    // poses.put("L", POSES.REEF_L);

    // poses.put("LT", StationPOSES.Left_top_station);
    // poses.put("LM", StationPOSES.Left_mid_station);
    // poses.put("LB", StationPOSES.Left_bot_station);
    // poses.put("RT", StationPOSES.Right_top_station);
    // poses.put("RM", StationPOSES.Right_mid_station);
    // poses.put("RB", StationPOSES.Right_bot_station);

    // if (DriverStation.getAlliance().isPresent()) {
    //   if (DriverStation.getAlliance().get() == Alliance.Red) {
    //     System.out.println("red");
    //     poses.put("A", FlippingUtil.flipFieldPose(POSES.REEF_A));
    //     poses.put("B", FlippingUtil.flipFieldPose(POSES.REEF_B));
    //     poses.put("C", FlippingUtil.flipFieldPose(POSES.REEF_C));
    //     poses.put("D", FlippingUtil.flipFieldPose(POSES.REEF_D));
    //     poses.put("E", FlippingUtil.flipFieldPose(POSES.REEF_E));
    //     poses.put("F", FlippingUtil.flipFieldPose(POSES.REEF_F));
    //     poses.put("G", FlippingUtil.flipFieldPose(POSES.REEF_G));
    //     poses.put("H", FlippingUtil.flipFieldPose(POSES.REEF_H));
    //     poses.put("I", FlippingUtil.flipFieldPose(POSES.REEF_I));
    //     poses.put("J", FlippingUtil.flipFieldPose(POSES.REEF_J));
    //     poses.put("K", FlippingUtil.flipFieldPose(POSES.REEF_K));
    //     poses.put("L", FlippingUtil.flipFieldPose(POSES.REEF_L));

    //     poses.put("LT", FlippingUtil.flipFieldPose(StationPOSES.Left_top_station));
    //     poses.put("LM", FlippingUtil.flipFieldPose(StationPOSES.Left_mid_station));
    //     poses.put("LB", FlippingUtil.flipFieldPose(StationPOSES.Left_bot_station));
    //     poses.put("RT", FlippingUtil.flipFieldPose(StationPOSES.Right_top_station));
    //     poses.put("RM", FlippingUtil.flipFieldPose(StationPOSES.Right_mid_station));
    //     poses.put("RB", FlippingUtil.flipFieldPose(StationPOSES.Right_bot_station));
    //   }
    // }

    // PathConstraints constraints = new PathConstraints(
    //     3,
    //     2,
    //     4,
    //     3);
    // // new PathConstraints(null, null, null, null)

    // String startString = posePlotterValues.getAutoString();
    // // String startString = posePlotterValues.getAutoStringWithFallback();
    
    // System.out.println(startString);
    // String[] stringArr = startString.split("-");
    // Command cmd = Commands.none();
    // Command parralelCmd = Commands.none();
    // Command nextCommand = Commands.none();
    // Boolean currentParralel = false;
    // for (String a : stringArr) {

    //   if (a.contains("4S")) {
    //     nextCommand = new autoshootlfour(-.12, s_ElevatorCom, s_CoralCom, false).withTimeout(2);
    //   } else if (a.contains("4")) {
    //     nextCommand = new elevatorCom(3, s_ElevatorCom, false);
    //   } else if (a.contains("0")) {
    //     nextCommand = new elevatorCom(1, s_ElevatorCom, true);
    //   } else if (a.matches("[A-L]")) {
    //     nextCommand = AutoBuilder.pathfindToPose(
    //         poses.get(a),
    //         constraints,
    //         0.00);
    //   } else if (a.contains("LT")) {
    //     nextCommand = AutoBuilder.pathfindToPose(
    //         poses.get(a),
    //         constraints,
    //         0.00);
    //   } else if (a.contains("LM")) {
    //     System.out.println(a);
    //     nextCommand = AutoBuilder.pathfindToPose(
    //         poses.get(a),
    //         constraints,
    //         0.00);
    //   } else if (a.contains("LB")) {
    //     nextCommand = AutoBuilder.pathfindToPose(
    //         poses.get(a),
    //         constraints,
    //         0.00);
    //   } else if (a.contains("RT")) {
    //     nextCommand = AutoBuilder.pathfindToPose(
    //         poses.get(a),
    //         constraints,
    //         0.00);
    //   } else if (a.contains("RM")) {
    //     nextCommand = AutoBuilder.pathfindToPose(
    //         poses.get(a),
    //         constraints,
    //         0.00);
    //   } else if (a.contains("RB")) {
    //     nextCommand = AutoBuilder.pathfindToPose(
    //         poses.get(a),
    //         constraints,
    //         0.00);
    //   }

    //   else if (stringArr.length == 0) {
    //     System.out.println("No Command!! Consider turning on fallback if at competition!!!!!!!!!!!!!!!");
    //   } else {
    //     System.out.println(a + "UNDEFINED COMMAND");
    //     nextCommand = Commands.none();
    //   }

    //   if (a.contains("+")) {
    //     // cmd = cmd.andThen(Commands.runOnce(()->System.out.println(a +
    //     // "Simultaneous")));
    //     parralelCmd = parralelCmd.alongWith(nextCommand);
    //     currentParralel = true;

    //     continue;
    //   } else if (currentParralel) {
    //     parralelCmd = parralelCmd.alongWith(nextCommand);
    //     cmd = cmd.andThen(parralelCmd);
    //     parralelCmd = Commands.none();
    //     currentParralel = false;
    //   } else {
    //     cmd = cmd.andThen(nextCommand);
    //   }
    // }
    // ; } else if (a.contains("T")) {
    //     // cmd = cmd.andThen(Commands.runOnce(() -> System.out.println(a)));
    //     nextCommand = new Intake(-.07, s_CoralCom);

    //   } else if (a.contains("S")) {
    //     nextCommand = (new Shoot(-.12, s_CoralCom));

    //   } else if (a.contains("3")) {
    //     nextCommand = new elevatorCom(2, s_ElevatorCom, false);
    //   } else if (a.contains("2")) {
    //     nextCommand = new elevatorCom(1, s_ElevatorCom, false);
    //  