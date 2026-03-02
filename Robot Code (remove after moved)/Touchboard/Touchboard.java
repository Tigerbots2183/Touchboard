package frc.robot.subsystems.Touchboard;

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

        return new Trigger(() -> dataSubscriber.readQueueValues().length > 0).onTrue(Commands.run(
                () -> CommandScheduler.getInstance().schedule(command.get().until(() -> !dataSubscriber.get()))

        ));
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

        return new Trigger(() -> dataSubscriber.readQueueValues().length > 0).onTrue(Commands.run(
                () -> CommandScheduler.getInstance().schedule(command.get().until(() -> !dataSubscriber.get()))

        ));

    }

    // One Shot Button methods
    public static Trigger bindOneShotButton(String topic, Command command) {

        final BooleanPublisher dataPublisher = datatable.getBooleanTopic(topic).publish();
        final BooleanSubscriber dataSubscriber = datatable.getBooleanTopic(topic).subscribe(false);

        Command setter = command.alongWith(Commands.runOnce(() -> dataPublisher.set(false)));

        return new Trigger(() -> dataSubscriber.get()).whileTrue(setter);
    }

    public static Trigger bindOneShotButton(String topic, Supplier<Command> command) {

        final BooleanPublisher dataPublisher = datatable.getBooleanTopic(topic).publish();
        final BooleanSubscriber dataSubscriber = datatable.getBooleanTopic(topic).subscribe(false);

        Command setter = command.get().alongWith(Commands.runOnce(() -> dataPublisher.set(false)));

        return new Trigger(() -> dataSubscriber.readQueueValues().length > 0).onTrue(Commands.runOnce(
                () -> CommandScheduler.getInstance()
                        .schedule(command.get().until(() -> dataSubscriber.readQueueValues().length > 0))

        ));
    }

    // Array of doubleSubscribers to avoid recreation on every trigger

    private static HashMap<String, DoubleSubscriber> DoubleSubscriberMap = new HashMap<String, DoubleSubscriber>();

    // Axis Methods

    public static Trigger bindAxis(String topic, Supplier<Command> command) {
        datatable.getDoubleTopic(topic).publish();
        DoubleSubscriber dataSubscriber;

        if (DoubleSubscriberMap.containsKey(topic)) {
            dataSubscriber = DoubleSubscriberMap.get(topic);
        } else {
            dataSubscriber = datatable.getDoubleTopic(topic).subscribe(0,
                    PubSubOption.pollStorage(1));
        }

        return new Trigger(() -> dataSubscriber.readQueueValues().length > 0).onTrue(Commands.runOnce(
                () -> CommandScheduler.getInstance()
                        .schedule(command.get().until(() -> dataSubscriber.readQueueValues().length > 0))

        ));
    }

    // Number Component Methods

    public static Trigger bindNumberComponent(String topic, Supplier<Command> command) {
        datatable.getDoubleTopic(topic).publish();
        DoubleSubscriber dataSubscriber;

        if (DoubleSubscriberMap.containsKey(topic)) {
            dataSubscriber = DoubleSubscriberMap.get(topic);
        } else {
            dataSubscriber = datatable.getDoubleTopic(topic).subscribe(0,
                    PubSubOption.pollStorage(2));
        }

        return new Trigger(() -> dataSubscriber.readQueueValues().length > 0).onTrue(Commands.runOnce(
                () -> CommandScheduler.getInstance()
                        .schedule(command.get().until(() -> dataSubscriber.readQueueValues().length > 0))

        ));
    }

    // AXIS + NUMBER COMPONENT value getter
    public static double getDoubleValue(String topic) {
        if (DoubleSubscriberMap.containsKey(topic)) {
            return DoubleSubscriberMap.get(topic).get();
        } else {
            final DoubleSubscriber dataSubscriber = datatable.getDoubleTopic(topic).subscribe(0,
                    PubSubOption.pollStorage(2));

            DoubleSubscriberMap.put(topic, dataSubscriber);

            return DoubleSubscriberMap.get(topic).get();
        }
    }

    private static HashMap<String, StringSubscriber> StringSubscriberMap = new HashMap<String, StringSubscriber>();

    // Dropdown Methods

    public static Trigger bindDropdown(String topic, Supplier<Command> command) {
        StringSubscriber dataSubscriber;

        if (DoubleSubscriberMap.containsKey(topic)) {
            dataSubscriber = StringSubscriberMap.get(topic);
        } else {
            dataSubscriber = datatable.getStringTopic(topic).subscribe("",
                    PubSubOption.pollStorage(2));
        }

        return new Trigger(() -> dataSubscriber.readQueueValues().length > 0).onTrue(Commands.runOnce(
                () -> CommandScheduler.getInstance()
                        .schedule(command.get().until(() -> dataSubscriber.readQueueValues().length > 0))

        ));
    }

    // Opt Group Methods

    public static Trigger bindOptGroup(String topic, Supplier<Command> command) {
        StringSubscriber dataSubscriber;

        if (DoubleSubscriberMap.containsKey(topic)) {
            dataSubscriber = StringSubscriberMap.get(topic);
        } else {
            dataSubscriber = datatable.getStringTopic(topic).subscribe("",
                    PubSubOption.pollStorage(2));
        }

        return new Trigger(() -> dataSubscriber.readQueueValues().length > 0).onTrue(Commands.runOnce(
                () -> CommandScheduler.getInstance()
                        .schedule(command.get().until(() -> dataSubscriber.readQueueValues().length > 0))

        ));
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
