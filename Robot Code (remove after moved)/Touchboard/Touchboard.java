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

    /**
     * Runs the given command when the action button is pressed. The command will run until it is finished, canceled, or the button is released.
     * @param topic The topic assigned in touchboard.
     * @param command The command to run when the button is pressed.
     * @return The trigger for the action button.
     */
    public static Trigger bindActionButton(String topic, Command command) {

        datatable.getBooleanTopic(topic).publish();
        final BooleanSubscriber dataSubscriber = datatable.getBooleanTopic(topic).subscribe(false);

        return new Trigger(() -> dataSubscriber.get()).whileTrue(command);
    }

    
    /**
     * Runs the given command when the action button is pressed. The command that will be proxied and will run until it is finished, canceled, or the button is released.
     * @param topic The topic assigned in touchboard.
     * @param command The command that will be proxied to run when the button is pressed.
     * @return The trigger for the action button.
     */
    public static Trigger bindActionButton(String topic, Supplier<Command> command) {

        datatable.getBooleanTopic(topic).publish();
        final BooleanSubscriber dataSubscriber = datatable.getBooleanTopic(topic).subscribe(false);

        return new Trigger(() -> dataSubscriber.get()).whileTrue(Commands.deferredProxy(command).ignoringDisable(true));
    }

    
    /**
     * Runs the given runnable repeatedly when the action button is pressed. The runnable will run until it is finished, canceled, or the button is released.
     * @param topic The topic assigned in touchboard.
     * @param runnable The runnable that repeats when the button is pressed.
     * @return The trigger for the action button.
     */
    public static Trigger bindActionButton(String topic, Runnable runnable) {

        return bindActionButton(topic, Commands.run(runnable).ignoringDisable(true));
    }

    // Toggle Button Methods

    /**
     * Runs the given command when the toggle button is pressed. The command that will be proxied and will run until it is finished, canceled, or the button is toggled off.
     * @param topic The topic assigned in touchboard.
     * @param command The command that will be proxied to run when the button is pressed.
     * @return The trigger for the toggle button.
     */
    public static Trigger bindToggleButton(String topic, Command command) {

        datatable.getBooleanTopic(topic).publish();
        final BooleanSubscriber dataSubscriber = datatable.getBooleanTopic(topic).subscribe(false);

        return new Trigger(() -> dataSubscriber.get()).whileTrue(command);
    }

    /**
     * Runs the given command when the toggle button is pressed. The command that will be proxied and will run until it is finished, canceled, or the button is toggled off.
     * @param topic The topic assigned in touchboard.
     * @param command The command that will be proxied to run when the button is pressed.
     * @return The trigger for the toggle button.
     */
    public static Trigger bindToggleButton(String topic, Supplier<Command> command) {

        datatable.getBooleanTopic(topic).publish();
        final BooleanSubscriber dataSubscriber = datatable.getBooleanTopic(topic).subscribe(false);

        return new Trigger(() -> dataSubscriber.get()).whileTrue(Commands.deferredProxy(command).ignoringDisable(true));

    }

    /**
     * Runs the given runnable repeatedly when the toggle button is pressed. The runnable will run until it is finished, canceled, or the button is toggled off.
     * @param topic The topic assigned in touchboard.
     * @param runnable The runnable that repeats when the button is pressed.
     * @return The trigger for the toggle button.
     */
    public static Trigger bindToggleButton(String topic, Runnable runnable) {

        return bindToggleButton(topic, Commands.run(runnable).ignoringDisable(true));
    }

    // One Shot Button methods

    /**
     * Runs the given command once when the one shot button is pressed. The command will run until it is finished or canceled.
     * @param topic The topic assigned in touchboard.
     * @param command The command to run when the button is pressed.
     * @return The trigger for the one shot button.
     */
    public static Trigger bindOneShotButton(String topic, Command command) {

        final BooleanPublisher dataPublisher = datatable.getBooleanTopic(topic).publish();
        final BooleanSubscriber dataSubscriber = datatable.getBooleanTopic(topic).subscribe(false);

        Trigger trigger = new Trigger(() -> dataSubscriber.get());

        return trigger.onTrue(command).onTrue(Commands.runOnce(() -> dataPublisher.set(false)).ignoringDisable(true));
    }

    /**
     * Runs the given command once when the one shot button is pressed. The command that will be proxied will run until it is finished or canceled.
     * @param topic The topic assigned in touchboard.
     * @param command The command that will be proxied to run when the button is pressed.
     * @return The trigger for the one shot button.
     */
    public static Trigger bindOneShotButton(String topic, Supplier<Command> command) {

        final BooleanPublisher dataPublisher = datatable.getBooleanTopic(topic).publish();
        final BooleanSubscriber dataSubscriber = datatable.getBooleanTopic(topic).subscribe(false);

        Trigger trigger = new Trigger(() -> dataSubscriber.get());

        trigger.onTrue(Commands.runOnce(() -> dataPublisher.set(false)).ignoringDisable(true));

        return trigger.onTrue(selfCancelingCommand(topic, command));
    }

    /**
     * Runs the given runnable once when the one shot button is pressed. The runnable will run until it is finished or canceled.
     * @param topic The topic assigned in touchboard.
     * @param runnable The runnable that runs once when the button is pressed.
     * @return The trigger for the one shot button.
     */
    public static Trigger bindOneShotButton(String topic, Runnable runnable) {

        return bindOneShotButton(topic, Commands.runOnce(runnable).ignoringDisable(true));
    }

    private static HashMap<String, BooleanSubscriber> BooleanSubscriberMap = new HashMap<String, BooleanSubscriber>();

    // AXIS + NUMBER COMPONENT value getter

    /**
     * Gets the boolean value of the given topic. This method will not duplicate the subscriber and can be called repeatedly.
     * @param topic The topic assigned in touchboard.
     * @return The boolean value of the given topic.
     */
    public static boolean getBooleanValue(String topic) {
        return BooleanSubscriberMap.computeIfAbsent(topic,
                t -> datatable.getBooleanTopic(t).subscribe(false)).get();
    }

    // Axis Methods

    /**
     * Runs the given command when the axis is moved. The command will be proxied and run until it is finished, canceled, or moved again.
     * @param topic The topic assigned in touchboard.
     * @param command The command that will be proxied to run when the axis is moved.
     * @return The trigger for the axis.
     */
    public static Trigger bindAxis(String topic, Supplier<Command> command) {
        datatable.getDoubleTopic(topic).publish();

        DoubleSubscriber dataSubscriber = datatable.getDoubleTopic(topic).subscribe(0,
                PubSubOption.pollStorage(1), PubSubOption.keepDuplicates(true));

        return new Trigger(() -> dataSubscriber.readQueueValues().length > 0)
                .onTrue(selfCancelingCommand(topic, command));
    }

    /**
     * Runs the given runnable once when the axis is moved. The runnable will be proxied and run once.
     * @param topic The topic assigned in touchboard.
     * @param runnable The runnable that will be proxied to run when the axis is moved.
     * @return The trigger for the axis.
     */
    public static Trigger bindAxis(String topic, Runnable runnable) {
        return bindAxis(topic, () -> Commands.runOnce(runnable).ignoringDisable(true));
    }

    // Number Component Methods

    /**
     * Runs the given command when the number component is changed. The command will be proxied and run until it is finished, canceled, or changed again.
     * @param topic The topic assigned in touchboard.
     * @param command The command that will be proxied to run when the number component is changed.
     * @return The trigger for the number component.
     */
    public static Trigger bindNumberComponent(String topic, Supplier<Command> command) {
        datatable.getDoubleTopic(topic).publish();

        DoubleSubscriber dataSubscriber = datatable.getDoubleTopic(topic).subscribe(0,
                PubSubOption.pollStorage(1), PubSubOption.keepDuplicates(true));

        return new Trigger(() -> dataSubscriber.readQueueValues().length > 0)
                .onTrue(selfCancelingCommand(topic, command));
    }

    /**
     * Runs the given runnable once when the number component is changed. The runnable will be proxied and run once.
     * @param topic The topic assigned in touchboard.
     * @param runnable The runnable that will be proxied to run when the number component is changed.
     * @return The trigger for the number component.
     */
    public static Trigger bindNumberComponent(String topic, Runnable runnable) {
        return bindNumberComponent(topic, () -> Commands.runOnce(runnable).ignoringDisable(true));
    }

    // Array of doubleSubscribers to avoid recreation on every trigger

    private static HashMap<String, DoubleSubscriber> DoubleSubscriberMap = new HashMap<String, DoubleSubscriber>();

    // AXIS + NUMBER COMPONENT value getter

    /**
     * Gets the double value of the given topic. This method will not duplicate the subscriber and can be called repeatedly.
     * @param topic The topic assigned in touchboard.
     * @return The double value of the given topic.
     */
    public static double getDoubleValue(String topic) {
        return DoubleSubscriberMap.computeIfAbsent(topic,
                t -> datatable.getDoubleTopic(t).subscribe(0.0)).get();
    }

    // Dropdown Methods

    /**
     * Runs the given command when the dropdown is changed. The command will be proxied and run until it is finished, canceled, or changed again.
     * @param topic The topic assigned in touchboard.
     * @param command The command that will be proxied to run when the dropdown is changed.
     * @return The trigger for the dropdown.
     */
    public static Trigger bindDropdown(String topic, Supplier<Command> command) {

        StringSubscriber dataSubscriber = datatable.getStringTopic(topic).subscribe("",
                PubSubOption.pollStorage(2));

        return new Trigger(() -> dataSubscriber.readQueueValues().length > 0)
                .onTrue(selfCancelingCommand(topic, command));
    }

    /**
     * Runs the given runnable once when the dropdown is changed. The runnable will be proxied and run once.
     * @param topic The topic assigned in touchboard.
     * @param runnable The runnable that will be proxied to run when the dropdown is changed.
     * @return The trigger for the dropdown.
     */
    public static Trigger bindDropdown(String topic, Runnable runnable) {
        return bindDropdown(topic, () -> Commands.runOnce(runnable).ignoringDisable(true));
    }

    // Opt Group Methods

    /**
     * Runs the given command when the opt group is changed. The command will be proxied and run until it is finished, canceled, or changed again.
     * @param topic The topic assigned in touchboard.
     * @param command The command that will be proxied to run when the opt group is changed.
     * @return The trigger for the opt group.
     */
    public static Trigger bindOptGroup(String topic, Supplier<Command> command) {

        StringSubscriber dataSubscriber = datatable.getStringTopic(topic).subscribe("",
                PubSubOption.pollStorage(2));

        return new Trigger(() -> dataSubscriber.readQueueValues().length > 0)
                .onTrue(selfCancelingCommand(topic, command));
    }

    /**
     * Runs the given runnable once when the opt group is changed. The runnable will be proxied and run once.
     * @param topic The topic assigned in touchboard.
     * @param runnable The runnable that will be proxied to run when the opt group is changed.
     * @return The trigger for the opt group.
     */
    public static Trigger bindOptGroup(String topic, Runnable runnable) {
        return bindOptGroup(topic, () -> Commands.runOnce(runnable).ignoringDisable(true));
    }

    private static HashMap<String, StringSubscriber> StringSubscriberMap = new HashMap<String, StringSubscriber>();

    // OPT GROUP + DROPDOWN COMPONENT value getter
    
    /**
     * Gets the string value of the given topic. This method will not duplicate the subscriber and can be called repeatedly.
     * @param topic The topic assigned in touchboard.
     * @return The string value of the given topic.
     */
    public static String getStringValue(String topic) {
        return StringSubscriberMap.computeIfAbsent(topic,
                t -> datatable.getStringTopic(t).subscribe("")).get();
    }

    // Helper Methods:

    private static final HashMap<String, Command> selfCancelingCommands = new HashMap<>();

    /**
     * Creates a self-canceling command that will cancel any previous command with the same topic when it is scheduled.
     * @param topic The topic assigned in touchboard.
     * @param commandSupplier The supplier that will provide the command to run when the button is pressed.
     * @return The self-canceling command.
     */
    private static Command selfCancelingCommand(String topic, Supplier<Command> commandSupplier) {
        return Commands.runOnce(() -> {
            Command previousCommand = selfCancelingCommands.get(topic);
            if (previousCommand != null) {
                previousCommand.cancel();
            }

            Command newCommand = Commands.deferredProxy(commandSupplier).ignoringDisable(true);
            selfCancelingCommands.put(topic, newCommand);
            CommandScheduler.getInstance().schedule(newCommand);
        }).ignoringDisable(true);
    }
}
