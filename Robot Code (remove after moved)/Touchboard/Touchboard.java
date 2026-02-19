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
import edu.wpi.first.wpilibj2.command.Commands;
import edu.wpi.first.wpilibj2.command.button.Trigger;

public class Touchboard {

    NetworkTableInstance inst = NetworkTableInstance.getDefault();
    NetworkTable datatable = inst.getTable("touchboard");

    public Touchboard() {

    }

    // Action Button Methods
    public Trigger bindActionButton(String topic, Command command) {

        datatable.getBooleanTopic(topic).publish();
        final BooleanSubscriber dataSubscriber = datatable.getBooleanTopic(topic).subscribe(false);

        return new Trigger(() -> dataSubscriber.get()).whileTrue(command);
    }

    public Trigger bindActionButton(String topic, Supplier<Command> command) {

        datatable.getBooleanTopic(topic).publish();
        final BooleanSubscriber dataSubscriber = datatable.getBooleanTopic(topic).subscribe(false);

        return new Trigger(() -> dataSubscriber.get()).whileTrue(command.get());
    }

    // Toggle Button Methods
    public Trigger bindToggleButton(String topic, Command command) {

        datatable.getBooleanTopic(topic).publish();
        final BooleanSubscriber dataSubscriber = datatable.getBooleanTopic(topic).subscribe(false);

        return new Trigger(() -> dataSubscriber.get()).whileTrue(command);
    }

    public Trigger bindToggleButton(String topic, Supplier<Command> command) {

        datatable.getBooleanTopic(topic).publish();
        final BooleanSubscriber dataSubscriber = datatable.getBooleanTopic(topic).subscribe(false);

        return new Trigger(() -> dataSubscriber.get()).whileTrue(command.get());
    }

    // One Shot Button methods
    public Trigger bindOneShotButton(String topic, Command command) {

        final BooleanPublisher dataPublisher = datatable.getBooleanTopic(topic).publish();
        final BooleanSubscriber dataSubscriber = datatable.getBooleanTopic(topic).subscribe(false);

        Command setter = command.andThen(Commands.runOnce(() -> dataPublisher.set(false)));

        return new Trigger(() -> dataSubscriber.get()).whileTrue(setter);
    }

    public Trigger bindOneShotButton(String topic, Supplier<Command> command) {

        final BooleanPublisher dataPublisher = datatable.getBooleanTopic(topic).publish();
        final BooleanSubscriber dataSubscriber = datatable.getBooleanTopic(topic).subscribe(false);

        Command setter = command.get().andThen(Commands.runOnce(() -> dataPublisher.set(false)));

        return new Trigger(() -> dataSubscriber.get()).whileTrue(setter);

    }

    // Array of doubleSubscribers to avoid recreation on every trigger

    HashMap<String, DoubleSubscriber> DoubleSubscriberMap = new HashMap<String, DoubleSubscriber>();

    // Axis Methods

    public Trigger bindAxis(String topic, Supplier<Command> command) {
        datatable.getDoubleTopic(topic).publish();
        DoubleSubscriber dataSubscriber;

        if (DoubleSubscriberMap.containsKey(topic)) {
            dataSubscriber = DoubleSubscriberMap.get(topic);
        } else {
            dataSubscriber = datatable.getDoubleTopic(topic).subscribe(0,
                    PubSubOption.pollStorage(1));
        }

        return new Trigger(() -> dataSubscriber.readQueueValues().length > 0).onTrue(command.get());
    }

    // Number Component Methods

    public Trigger bindNumberComponent(String topic, Supplier<Command> command) {
        datatable.getDoubleTopic(topic).publish();
        DoubleSubscriber dataSubscriber;

        if (DoubleSubscriberMap.containsKey(topic)) {
            dataSubscriber = DoubleSubscriberMap.get(topic);
        } else {
            dataSubscriber = datatable.getDoubleTopic(topic).subscribe(0,
                    PubSubOption.pollStorage(1));
        }

        return new Trigger(() -> dataSubscriber.readQueueValues().length > 0).onTrue(command.get());
    }

    // AXIS + NUMBER COMPONENT value getter
    public double getDoubleValue(String topic) {
        if (DoubleSubscriberMap.containsKey(topic)) {
            return DoubleSubscriberMap.get(topic).get();
        } else {
            final DoubleSubscriber dataSubscriber = datatable.getDoubleTopic(topic).subscribe(0,
                    PubSubOption.pollStorage(1));

            DoubleSubscriberMap.put(topic, dataSubscriber);

            return DoubleSubscriberMap.get(topic).get();
        }
    }

    HashMap<String, StringSubscriber> StringSubscriberMap = new HashMap<String, StringSubscriber>();

    //Dropdown Methods

    public Trigger bindDropdown(String topic, Supplier<Command> command) {
        datatable.getDoubleTopic(topic).publish();
        StringSubscriber dataSubscriber;

        if (DoubleSubscriberMap.containsKey(topic)) {
            dataSubscriber = StringSubscriberMap.get(topic);
        } else {
            dataSubscriber = datatable.getStringTopic(topic).subscribe("",
                    PubSubOption.pollStorage(1));
        }

        return new Trigger(() -> dataSubscriber.readQueueValues().length > 0).onTrue(command.get());
    }

    //Opt Group Methods

    public Trigger bindOptGroup(String topic, Supplier<Command> command) {
        datatable.getDoubleTopic(topic).publish();
        StringSubscriber dataSubscriber;

        if (DoubleSubscriberMap.containsKey(topic)) {
            dataSubscriber = StringSubscriberMap.get(topic);
        } else {
            dataSubscriber = datatable.getStringTopic(topic).subscribe("",
                    PubSubOption.pollStorage(1));
        }

        return new Trigger(() -> dataSubscriber.readQueueValues().length > 0).onTrue(command.get());
    }

    // OPT GROUP + DROPDOWN COMPONENT value getter
    public String getStringValue(String topic) {
        if (StringSubscriberMap.containsKey(topic)) {
            return StringSubscriberMap.get(topic).get();
        } else {
            final StringSubscriber dataSubscriber = datatable.getStringTopic(topic).subscribe("",
                    PubSubOption.pollStorage(1));

            StringSubscriberMap.put(topic, dataSubscriber);

            return StringSubscriberMap.get(topic).get();
        }
    }
}
