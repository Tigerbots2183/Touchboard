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

    private static int globalKeyIncrement = 0;
    private static double globalValueIncrement = 0.0;

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

    // // One Shot Button methods
    // public static Trigger bindOneShotButton(String topic, Command command) {

    // final BooleanPublisher dataPublisher =
    // datatable.getBooleanTopic(topic).publish();
    // final BooleanSubscriber dataSubscriber =
    // datatable.getBooleanTopic(topic).subscribe(false);

    // Command setter =
    // command.alongWith(Commands.waitSeconds(0).ignoringDisable(true)
    // .andThen(Commands.runOnce(() ->
    // dataPublisher.set(false)).ignoringDisable(true)));

    // return new Trigger(() -> dataSubscriber.get()).onTrue(setter);
    // }

    // public static Trigger bindOneShotButton(String topic, Supplier<Command>
    // command) {

    // final BooleanPublisher dataPublisher =
    // datatable.getBooleanTopic(topic).publish();
    // final BooleanSubscriber dataSubscriber =
    // datatable.getBooleanTopic(topic).subscribe(false);

    // Supplier<Command> setter = () ->
    // command.get().alongWith(Commands.waitSeconds(0).ignoringDisable(true)
    // .andThen(Commands.runOnce(() ->
    // dataPublisher.set(false)).ignoringDisable(true)));

    // return new Trigger(() -> dataSubscriber.get()).onTrue(Commands.runOnce(
    // () -> CommandScheduler.getInstance()
    // .schedule(setter.get().until(() -> !dataSubscriber.get())))
    // .ignoringDisable(true));
    // }
    private static HashMap<String, Double> BooleanOverrideMap = new HashMap<String, Double>();

    public static void setBooleanOverrideKey(String binder, Double OverrideKey) {
        BooleanOverrideMap.put(binder, OverrideKey);
    }

    public static Double getBooleanOverrideKey(String binder) {
        return BooleanOverrideMap.get(binder);
    }

    public static Trigger bindOneShotButton(String topic, Command command) {

        final BooleanPublisher dataPublisher = datatable.getBooleanTopic(topic).publish();
        final BooleanSubscriber dataSubscriber = datatable.getBooleanTopic(topic).subscribe(false);

        return new Trigger(() -> dataSubscriber.get()).onTrue(Commands.runOnce(() -> {

            CommandScheduler.getInstance().schedule(command);// .until(()-> getBooleanOverrideKey(binder) !=
                                                             // currentKey));
            dataPublisher.set(false);

        }).ignoringDisable(true));
    }

    public static Trigger bindOneShotButton(String topic, Supplier<Command> command) {

        final BooleanPublisher dataPublisher = datatable.getBooleanTopic(topic).publish();
        final BooleanSubscriber dataSubscriber = datatable.getBooleanTopic(topic).subscribe(false);

        globalKeyIncrement++;
        String binder = topic + globalKeyIncrement;

        return new Trigger(() -> dataSubscriber.get()).onTrue(Commands.runOnce(() -> {
            globalValueIncrement++;

            double currentKey = globalValueIncrement;
            setBooleanOverrideKey(binder, globalValueIncrement);

            CommandScheduler.getInstance()
                    .schedule(command.get().until(() -> getBooleanOverrideKey(binder) != currentKey));
            dataPublisher.set(false);
        }).ignoringDisable(true));
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
        globalKeyIncrement++;
        String binder = topic + globalKeyIncrement;

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
                            globalValueIncrement++;

                            double currentKey = globalValueIncrement;
                            setDoubleOverrideKey(binder, globalValueIncrement);

                            CommandScheduler.getInstance().schedule(
                                    command.get().until(() -> getDoubleOverrideKey(binder) != currentKey));
                        }

                ).ignoringDisable(true));
    }

    // Number Component Methods

    public static Trigger bindNumberComponent(String topic, Supplier<Command> command) {
        datatable.getDoubleTopic(topic).publish();
        globalKeyIncrement++;
        String binder = topic + globalKeyIncrement;

        DoubleSubscriber dataSubscriber;

        if (DoubleSubscriberMap.containsKey(topic)) {
            dataSubscriber = DoubleSubscriberMap.get(topic);
        } else {
            dataSubscriber = datatable.getDoubleTopic(topic).subscribe(0,
                    PubSubOption.keepDuplicates(true), PubSubOption.pollStorage(2));
        }

        return new Trigger(() -> dataSubscriber.readQueueValues().length > 0).onTrue(Commands.runOnce(
                () -> {
                    globalValueIncrement++;

                    double currentKey = globalValueIncrement;
                    setDoubleOverrideKey(binder, globalValueIncrement);

                    CommandScheduler.getInstance().schedule(
                            command.get().until(() -> getDoubleOverrideKey(binder) != currentKey));
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
        globalKeyIncrement++;
        String binder = topic + globalKeyIncrement;

        if (DoubleSubscriberMap.containsKey(topic)) {
            dataSubscriber = StringSubscriberMap.get(topic);
        } else {
            dataSubscriber = datatable.getStringTopic(topic).subscribe("",
                    PubSubOption.pollStorage(2));
        }

        return new Trigger(() -> dataSubscriber.readQueueValues().length > 0).onTrue(Commands.runOnce(
                () -> {
                    globalValueIncrement++;

                    double currentKey = globalValueIncrement;
                    setStringOverrideKey(binder, globalValueIncrement);

                    CommandScheduler.getInstance().schedule(
                            command.get().until(() -> getStringOverrideKey(binder) != currentKey));
                }

        ).ignoringDisable(true));
    }

    // Opt Group Methods

    public static Trigger bindOptGroup(String topic, Supplier<Command> command) {
        StringSubscriber dataSubscriber;
        globalKeyIncrement++;
        String binder = topic + globalKeyIncrement;

        if (DoubleSubscriberMap.containsKey(topic)) {
            dataSubscriber = StringSubscriberMap.get(topic);
        } else {
            dataSubscriber = datatable.getStringTopic(topic).subscribe("",
                    PubSubOption.pollStorage(2));
        }

        return new Trigger(() -> dataSubscriber.readQueueValues().length > 0).onTrue(Commands.runOnce(
                () -> {
                    globalValueIncrement++;

                    double currentKey = globalValueIncrement;
                    setStringOverrideKey(binder, globalValueIncrement);

                    CommandScheduler.getInstance().schedule(
                            command.get().until(() -> getStringOverrideKey(binder) != currentKey));
                }

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
