# **Touchboard**
A touchscreen button board that communicates over NT4.


## **How it works**
Touchboard works by sending data over network tables to the robot. I've made adding buttons easy by simply editing the HTML and the layout can be styled with css grid, css flex, or any css.

If you're not familiar with network tables, you should still be able to use this. I explain how things work but you don't have to understand everything. Just think of the topic name as a shared variable that the robot and touchboard need.

Thanks to mechanical advantage for the nt4.js library that sends values to the robot, I have made modifications to that library for streamlining and to support struct decoding. 

# **Usage**

## **Setting Team Number / IP**

Once Touchboard is open, a pop up will appear asking for the team number or IP, put in your team number if connecting to a robot. If you wish to connect Touchboard to a simulator, put in localhost. 

To change it after it is set, press the # icon at the top of the screen. 

## **Opening the Editor**

To use Touchboard components, they must be placed in a tab. Press the ✎ button at the top of the screen.

## **Tabs**

### **Tab Navigator**
On widescreen devices, tabs with the visible state are displayed at the top of the screen. 

### **Tab Manager**
To open the tab manager, Press the ☰ Icon. This will hold both the visible tabs and minimized tabs. On non widescreen devices visible tabs and minimized tabs are the same. This tab manager will display buttons to edit and manage the tabs when the editor is open. 

### **Adding Tabs**
To add a tab, press the + icon at the top left of the screen. A pop up will open to name the tab, once the name has been entered press the ✓ button to add it.

### **Editing Tab Grid**
To edit the size of the grid, two inputs are at the bottom left of the editor, use those to change the size of the grid. Note that if there is a component blocking the grid from getting smaller, a red outline will appear around it. 

### **Changing Tab Visibility**
Tabs have three states they can be in:
- Visible: Appears at the top of the screen on widescreen devices
- Minimized: Appears in the tab manager on the side of the screen when opened (The ☰ icon)
- Hidden: Tab is saved but not visible at the top or the tab manager on the side of the scren

To change visibility, open the tab manager while the editor is open, and use the handles on the tabs (also the ☰ icon next to the tab) and drag them under the state that you want it to have.

To remove a tab, press the ❌ icon. 

## **Connecting**

### **Connection Slider**

To connect to the robot or simulator, ensure the team number and ip have been set correctly and flip the slider. Touchboard will constantly refresh until connected to the robot, to stop it from connecting, flip the slider again. 

### **Connection Notes**

The dashboard is able to connect and send values to the robot while it is disabled, so if you pass in a command that has `.ignoringDisabled(true)`, it can run. (Of course, motors and other physical components are not allowed to move until enabled, but this can be useful for setting a starting position for example). On the field, the dashboard can still connect while its plugged in to the FMS before the match begins. 

## **Components**

The top right of the editor has two words, Input and Output. Clicking on each will change what components you can add. 

### **Input Components**

Input components are listed to the right of the screen, these components give the robot various different types of input. 

### **Output Components**

Output components differ based on the type of the output. The output menu shows the avalible outputs from Network Tables when the robot connects. 

Touchboard has the ability to get all basic value types, and is also able to decode structs, but not protos at this time. 

**Any values under the Touchboard folder may not be the robot sees, they are fed back into touchboard, so there is no guarantee that what is in the touchboard folder is the value that the robot sees, but all other values and folders are what the robot sees.**

To add an output, click on the output desired and it will open up the available components for that type. 

### **Placing Components**

To place components, click the desired component, and then release. Components are given spots on the grid, to specify what spot, after you initally release, click again on any square in the grid then drag the box till the desired spots are given then release again. 

The menu is still displayed if you want to add any more output viewers of that topic to the grid

### **Editing Components**

To edit a component, click on the desired component, the sidebar will switch to an edit menu. 

Input components may be given a name and **must** have a topic. 

Output components are assigned the topic that was clicked on and is given a default name that can be changed. The topic can be changed by clicking the change button, and if the topic path goes off the screen it can be scrolled to the right. 

The fill button at the bottom will maintain the last value if retain similar properties is checked in the bottom bar. If fill is checked the component will attempt to fill the avalible space. 

### **Removing Components**

Click the 🗑 icon to enable the remove mode, the components will shake to show that the remove mode is active, click on the component(s) that you want to remove, to disable remove mode, click the 🗑 icon again. (It will also stop the mode under other conditions as well)
 

# **Code Tutorial**

Snippets on how to access the values that touchboard provides. Various options are given depending on the component. 

## **Binders**

Touchboard Input components will send values to the robot even if commands have not been bound to them. Binders streamline the process of triggering commands when the buttons have been modified by the user. 

Touchboard works mainly due to the use of Wpilib triggers, and each binder method will return the trigger so that you can add debounce or other modifiers to it if wanted. 

 You can have multiple buttons assigned to the same topic (although it may have unexpected behaviour) but they all must have the same topic type. Buttons return booleans, Axis and Number Components return doubles, Dropdown and Optgroups return strings.


### **Action Button**

Action buttons behave like the trigger ` .whileTrue()` that wpilib provides. It starts the command once the button is pressed and cancels it once it is released. 

The setup for an action button is as follows (Ours is in `configureBindings()`)

```java
  Touchboard.bindActionButton("*Topic", *Command);
```

Command suppliers are also supported:

```java
  Touchboard.bindActionButton("*Topic", *Supplier<Command>);
```

### **Toggle Button**
Toggle buttons behave like the trigger ` .toggleOnTrue()` that Wpilib provides. It starts the command once the button is pressed and cancels it once it is pressed again.

The setup for a toggle button is as follows (Ours is in `configureBindings()`)
```java
  Touchboard.bindToggleButton("*Topic", *Command);
```

Command suppliers are also supported:

```java
  Touchboard.bindToggleButton("*Topic", *Supplier<Command>);
```

### **One Shot Buttons**

One Shot buttons behave like the trigger ` .onTrue()` that Wpilib provides. It starts the command once the button is pressed and keeps running once it is released. If the button is pressed again the old command that was scheduled automatically gets cancelled.

The setup for a one shot button is as follows (Ours is in `configureBindings()`)
```java
  Touchboard.bindOneShotButton("*Topic", *Command);
```

Command suppliers are also supported:

```java
  Touchboard.bindOneShotButton("*Topic", *Supplier<Command>);
```

### **Axis**

Axis will schedule a command once the axis is moved, and will cancel and schedule a new command once it moved after the initial one. Note that the axis still schedules a command when it returns to zero, and it will remain scheduled. 

This will only schedule the command when it is moved, Only command suppliers are supported:

```java
  Touchboard.bindAxis("*Topic", *Supplier<Command>);
```

To pass in the axis value once it is moved you must pass the value into the command. For example:

```java
  Supplier<Command> example = ()-> new exampleCommand(Touchboard.getDoubleValue("*Topic"))
  Touchboard.bindAxis("*Topic", example);
```

### **Number Component**

Number Component will schedule a command once the value changes, and will cancel and schedule a new command once it changes after the initial one. Note that the Number Component still schedules a command when it returns to zero, and it will remain scheduled. 

This will only schedule the command when it is changed, Only command suppliers are supported:

```java
  Touchboard.bindNumberComponent("*Topic", *Supplier<Command>);
```

To pass in the Number Component value once it is changed you must pass the value into the command. For example:

```java
  Supplier<Command> example = ()-> new exampleCommand(Touchboard.getDoubleValue("*Topic"))
  Touchboard.bindNumberComponent("*Topic", example);
```

### **Dropdown**

Dropdown will schedule a command once the value changes, and will cancel and schedule a new command once it changed after the inital one. Note that the command will execute once the dashboard connects. 

This will only schedule the command when it is changed, Only command suppliers are supported:

```java
  Touchboard.bindDropdown("*Topic", *Supplier<Command>);
```

To pass in the Dropdowns value once it is changed you must pass the value into the command. For example:

```java
  Supplier<Command> example = ()-> new exampleCommand(Touchboard.getStringValue("*Topic"))
  Touchboard.bindDropdown("*Topic", example);
```

### **Opt Group**

Opt Group will schedule a command once the value changes, and will cancel and schedule a new command once it changes after the initial one. Note that the command will execute once the dashboard connects. 

This will only schedule the command when it is changed, Only command suppliers are supported:

```java
  Touchboard.bindOptGroup("*Topic", *Supplier<Command>);
```

To pass in the Opt Groups value once it is changed you must pass the value into the command. For example:

```java
  Supplier<Command> example = ()-> new exampleCommand(Touchboard.getStringValue("*Topic"))
  Touchboard.bindOptGroup("*Topic", example);
```

## **Getters**

Methods are provided to retrieve Touchboard values, the parameter should be the topic name (without the touchboard path as it already begins in that path).

```java
  Touchboard.getDoubleValue("*Topic")
  Touchboard.getStringValue("*Topic")
```


## **Output Components**

There are many different components that output data retrieved from the robots networktables. Touchboard currently supports all types, but does not have any components for arrays. Touchboard also supports **struct decoding**, individual values from the structs can be displayed with the standard components for that type.

### **Basic Subscription**

This components lists the given name and value on the dashboard, the text will wrap in fill mode. This component supports all types.

### **Basic Logger**

This components logs all value updates and stores them. There is a ⏸ button that stops displaying the logged values, but they are still logged in the background while paused. The component will display the last 100 values, to show all the values, press the ⏿ button. The values will stop showing after the component is unpaused again and revert back to the 100 limit. This component supports all types.

###  **Number Line**

This component shows the current value of a number, the top of the number line shows 5 values. These values show the minimum, between, mid, between, and maximum amounts, even if their position isnt exactly at those points, these numbers are rounded to the nearest whole number. If no min or max is given, the number line will derive this information based on the minimum and maximum value it reads. This component supports numerical types.

###  **Radial Gauge**

This value displays the current value of a number on a guage. If no maximum value is given, the maximum value will be the maximum degree value. The max value can be changed and the guage values will respond accordingly. The offset value rotates the gauge by the given value. This component supports numerical types. 

###  **Camera Stream / Recorder**

Touchboard has the ability to show camera streams from the robot, to access it, go to the camera stream you want and click on the stream button. Streams are technically string arrays of urls, but touchboard displays it as the stream type. Touchboard will attempt each url in the list until one works.

Touchboard has the ability to record camera streams in the app, without the use of OBS or other recording software. Streams can be manually recorded by pressing the 🔴 button on the component. Recordings can be automatically started by adding conditions in the sidebar. FMS = Field management software linked to driverstation, DS = driverstation linked without FMS. Connected means when touchboard connects, and enabled starts recording when any mode is enabled, then stops after the robot has been disabled for 8 seconds, this is to allow time between auto and teleop when on the field. When the recording stops, it saves and the downloads itself. But if touchboard is closed before the stream downloads, it will be lost. You can choose to save as WebM (More Effiecent) or Mp4 (More compatability), but the dashboard must be refreshed before that change will take effect for technical reasons. 