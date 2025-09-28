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
        string_Sub.close();

        return currentString;

    }

    public static void setFallbackAuto(String defaultValue){
        defaultAuto = defaultValue;
    }

    public static int stringStatus() {
        string_Sub = datatable.getStringTopic("posePlotterFinalString").subscribe("NA");
        String currentString = string_Sub.get();
        string_Sub.close();
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
        string_Sub.close();

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
 