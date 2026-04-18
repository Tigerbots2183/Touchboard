package frc.robot.util;

import java.util.HashMap;
import java.util.function.Supplier;

import edu.wpi.first.networktables.BooleanPublisher;
import edu.wpi.first.networktables.BooleanSubscriber;
import edu.wpi.first.networktables.DoubleSubscriber;
import edu.wpi.first.networktables.NetworkTable;
import edu.wpi.first.networktables.NetworkTableInstance;
import edu.wpi.first.networktables.PubSubOption;
import edu.wpi.first.networktables.StringSubscriber;
import edu.wpi.first.wpilibj2.command.Command;
import edu.wpi.first.wpilibj2.command.CommandScheduler;
import edu.wpi.first.wpilibj2.command.Commands;
import edu.wpi.first.wpilibj2.command.button.Trigger;

public class Touchboard {

    private static NetworkTableInstance inst = NetworkTableInstance.getDefault();
    private static NetworkTable datatable = inst.getTable("touchboard");

    public Touchboard() {

    }

    // Action Button Methods
    public static Trigger bindActionButton(String topic, Command command) {

        datatable.getBooleanTopic(topic).publish();
        final BooleanSubscriber dataSubscriber = datatable.getBooleanTopic(topic).subscribe(false);

        return new Trigger(() -> dataSubscriber.get()).whileTrue(command);
    }

    public static Trigger bindActionButton(String topic, Supplier<Command> command) {

        datatable.getBooleanTopic(topic).publish();
        final BooleanSubscriber dataSubscriber = datatable.getBooleanTopic(topic).subscribe(false);

        return new Trigger(() -> dataSubscriber.get()).onTrue(Commands.runOnce(
                () -> CommandScheduler.getInstance().schedule(command.get().until(() -> !dataSubscriber.get()))

        ).ignoringDisable(true));
    }

    // Toggle Button Methods
    public static Trigger bindToggleButton(String topic, Command command) {

        datatable.getBooleanTopic(topic).publish();
        final BooleanSubscriber dataSubscriber = datatable.getBooleanTopic(topic).subscribe(false);

        return new Trigger(() -> dataSubscriber.get()).whileTrue(command);
    }

    public static Trigger bindToggleButton(String topic, Supplier<Command> command) {

        datatable.getBooleanTopic(topic).publish();
        final BooleanSubscriber dataSubscriber = datatable.getBooleanTopic(topic).subscribe(false);

        return new Trigger(() -> dataSubscriber.get()).onTrue(Commands.runOnce(
                () -> CommandScheduler.getInstance().schedule(command.get().until(() -> !dataSubscriber.get()))

        ).ignoringDisable(true));

    }

    // One Shot Button methods
    public static Trigger bindOneShotButton(String topic, Command command) {

        final BooleanPublisher dataPublisher = datatable.getBooleanTopic(topic).publish();
        final BooleanSubscriber dataSubscriber = datatable.getBooleanTopic(topic).subscribe(false);

        Command setter = command.alongWith(Commands.waitSeconds(0).ignoringDisable(true)
                .andThen(Commands.runOnce(() -> dataPublisher.set(false)).ignoringDisable(true)));

        return new Trigger(() -> dataSubscriber.get()).whileTrue(setter);
    }

    public static Trigger bindOneShotButton(String topic, Supplier<Command> command) {

        final BooleanPublisher dataPublisher = datatable.getBooleanTopic(topic).publish();
        final BooleanSubscriber dataSubscriber = datatable.getBooleanTopic(topic).subscribe(false);

        Supplier<Command> setter = () -> command.get().alongWith(Commands.waitSeconds(0).ignoringDisable(true)
                .andThen(Commands.runOnce(() -> dataPublisher.set(false)).ignoringDisable(true)));

        return new Trigger(() -> dataSubscriber.get()).onTrue(Commands.runOnce(
                () -> CommandScheduler.getInstance()
                        .schedule(setter.get().until(() -> !dataSubscriber.get())))
                .ignoringDisable(true));
    }

    // Array of doubleSubscribers to avoid recreation on every trigger

    private static HashMap<String, DoubleSubscriber> DoubleSubscriberMap = new HashMap<String, DoubleSubscriber>();
    private static HashMap<String, Double> DoubleOverrideMap = new HashMap<String, Double>();

    public static void setDoubleOverrideKey(String binder, Double OverrideKey) {
        DoubleOverrideMap.put(binder, OverrideKey);
    }

    public static Double getDoubleOverrideKey(String binder) {
        return DoubleOverrideMap.get(binder);
    }
    // Axis Methods

    public static Trigger bindAxis(String topic, Supplier<Command> command) {
        datatable.getDoubleTopic(topic).publish();
        String binder = topic + Math.random();

        DoubleSubscriber dataSubscriber;

        if (DoubleSubscriberMap.containsKey(topic)) {
            dataSubscriber = DoubleSubscriberMap.get(topic);
        } else {
            dataSubscriber = datatable.getDoubleTopic(topic).subscribe(0,
                    PubSubOption.pollStorage(1), PubSubOption.keepDuplicates(true));
        }

        return new Trigger(() -> dataSubscriber.readQueue().length > 0).onChange(
                Commands.runOnce(
                        () -> {
                            Double currentKey = Math.random();
                            setDoubleOverrideKey(binder, currentKey);

                            CommandScheduler.getInstance().schedule(
                                    command.get().until(() -> getDoubleOverrideKey(binder) != currentKey));
                        }

                ).ignoringDisable(true));
    }

    // Number Component Methods

    public static Trigger bindNumberComponent(String topic, Supplier<Command> command) {
        datatable.getDoubleTopic(topic).publish();
        String binder = topic + Math.random();

        DoubleSubscriber dataSubscriber;

        if (DoubleSubscriberMap.containsKey(topic)) {
            dataSubscriber = DoubleSubscriberMap.get(topic);
        } else {
            dataSubscriber = datatable.getDoubleTopic(topic).subscribe(0,
                    PubSubOption.keepDuplicates(true), PubSubOption.pollStorage(2));
        }

        return new Trigger(() -> dataSubscriber.readQueueValues().length > 0).onTrue(Commands.runOnce(
                () -> {
                    Double currentKey = Math.random();
                    setDoubleOverrideKey(binder, currentKey);

                    CommandScheduler.getInstance()
                            .schedule(command.get().until(() -> currentKey != getDoubleOverrideKey(binder)));
                }));
    }

    // AXIS + NUMBER COMPONENT value getter
    public static double getDoubleValue(String topic) {
        if (DoubleSubscriberMap.containsKey(topic)) {
            // System.out.println(DoubleSubscriberMap.size());
            return DoubleSubscriberMap.get(topic).get();
        } else {
            final DoubleSubscriber dataSubscriber = datatable.getDoubleTopic(topic).subscribe(0,
                    PubSubOption.keepDuplicates(true), PubSubOption.pollStorage(2));

            DoubleSubscriberMap.put(topic, dataSubscriber);

            return DoubleSubscriberMap.get(topic).get();
        }
    }

    private static HashMap<String, StringSubscriber> StringSubscriberMap = new HashMap<String, StringSubscriber>();
    private static HashMap<String, Double> StringOverrideMap = new HashMap<String, Double>();

    public static void setStringOverrideKey(String binder, Double OverrideKey) {
        StringOverrideMap.put(binder, OverrideKey);
    }

    public static Double getStringOverrideKey(String binder) {
        return StringOverrideMap.get(binder);
    }
    // Dropdown Methods

    public static Trigger bindDropdown(String topic, Supplier<Command> command) {
        StringSubscriber dataSubscriber;
        String binder = topic + Math.random();

        if (DoubleSubscriberMap.containsKey(topic)) {
            dataSubscriber = StringSubscriberMap.get(topic);
        } else {
            dataSubscriber = datatable.getStringTopic(topic).subscribe("",
                    PubSubOption.pollStorage(2));
        }

        return new Trigger(() -> dataSubscriber.readQueueValues().length > 0).onTrue(Commands.runOnce(
                () -> {
                    Double currentKey = Math.random();
                    setStringOverrideKey(binder, currentKey);
                    CommandScheduler.getInstance()
                        .schedule(command.get().until(() -> currentKey != getStringOverrideKey(binder))
                                .ignoringDisable(true));
                            }

        ).ignoringDisable(true));
    }

    // Opt Group Methods

    public static Trigger bindOptGroup(String topic, Supplier<Command> command) {
        StringSubscriber dataSubscriber;
        String binder = topic + Math.random();

        if (DoubleSubscriberMap.containsKey(topic)) {
            dataSubscriber = StringSubscriberMap.get(topic);
        } else {
            dataSubscriber = datatable.getStringTopic(topic).subscribe("",
                    PubSubOption.pollStorage(2));
        }

        return new Trigger(() -> dataSubscriber.readQueueValues().length > 0).onTrue(Commands.runOnce(
                () -> {
                    Double currentKey = Math.random();
                    setStringOverrideKey(binder, currentKey);
                    
                    CommandScheduler.getInstance()
                        .schedule(command.get().until(() -> currentKey != getStringOverrideKey(binder))
                                .ignoringDisable(true));}

        ).ignoringDisable(true));
    }

    // OPT GROUP + DROPDOWN COMPONENT value getter
    public static String getStringValue(String topic) {
        if (StringSubscriberMap.containsKey(topic)) {
            return StringSubscriberMap.get(topic).get();
        } else {
            final StringSubscriber dataSubscriber = datatable.getStringTopic(topic).subscribe("",
                    PubSubOption.pollStorage(2));

            StringSubscriberMap.put(topic, dataSubscriber);

            return StringSubscriberMap.get(topic).get();
        }
    }
}
