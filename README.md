# Touchboard
A touchscreen button board that communicates over networktables.


## How it works
Touchboard works by sending data over network tables to the robot. I've made adding buttons easy by simply editing the HTML and the layout can be styled with css grid, css flex, or any css.

If you're not familiar with network tables, you should still be able to use this. I explain how things work but you don't have to understand everything. Just think of the topic name as a shared variable that the robot and touchboard need.

Thanks to mechanical advantage for the nt4.js library that sends values to the robot!

## Setup
Touchboard is built with electron, after cloning or downloading the repository, run


```
npm install
```


Then drag the touchboard folder with java subsystems into the subsystem folder in your robot. (Will look into making this a vendordep)


## Components
There are three types of buttons. An **Action Button** which executes a command when pressed and ends the command when released, an **One Shot Button** which executes the command once when pressed, and a **Toggle Button** which toggles a command on and off when pressed.
There is a **Axis Knob** which sends a double to a command.
There is a **Drop Down** which sends a string to a command.
There is a **Number Input** which sends a double to a command.
<!-- Lastly, there is a **Subscription Shower** that shows network table values.  -->


## Development
During development, using the live server extension on the index.html file is recommended, this makes development much quicker. Everything works this way, the page can connect to the robot and its mostly the same as the built app.


## Adding Tabs


Adding tabs is simple. In the `.tabNav` add a new tab `div` with the `data-page` attribute being the class name of the tab you want it to reference, with a period in front of it. `Displaytype` sets the css display value of the tab when it's clicked. It defaults to grid if none is provided.


- The `tabConnection` class dims the tab while not connected to emphasize that the tab is unusable while not connected.
- The `currentTab` class should be assigned to the initial starting tab in tabNav.
```html
<div class="tab tabConnection" data-page=".*tabClass" data-displaytype="*display">*DisplayName</div>
```
And then in the `body` of the html add the tab with the class reference in the tabnav (without the period)
```html
<div class="*tabClass page">
    <!-- Components -->
</div>
```
Then you can style this with css. Set the display value for the tab to none if the tab is not the initial one, and the displaytype to whatever value you want it to display as (block, inline, flex, etc).




## Component Creation And Customization
Each component is customizable and is added by making a new html element. The component is customized using classes and data-value attributes. Touchboard scans each tab for these buttons and makes everything work for you. You can see how these elements look in the ui test tab. If for styling or other purposes you want to put buttons in a `div`, in order for touchboard to scan for them you must add "btnHolder" to the classes of that parent `div` element.


### Action Button
Here is a template of a **Action Button**

```html
<button  class="actionButton animatedButton"  data-type="boolean"  data-topic="*topic" data-value="false">*name</button>
```

- The data-type for buttons should always be boolean.
- The data-topic attribute will publish the button's value to that topic on the network tables. (Each component must have a unique topic).
- The data-value for action buttons should be false.
- Action buttons must have both the `actionButton` class and the `animatedButton` class.
- The display name is put in the element.


**This is the robot side code** (Ours is in `robotContainer`)


```java
  private final ActionButton *name = new ActionButton(*topic, new *Command);
```


### Toggle Button
Here is a template of a **Toggle Button**


```html
<button class="toggleButton animatedButton" data-type="boolean" data-topic="*topic" data-value="*initalValue">*name</button>
```
- The data-type for buttons should always be boolean.
- The data-topic attribute will publish the button's value to that topic on the network tables. (Each component must have a unique topic).
- The data-value sets the initial value for the toggle button. If the data-value is set to true, in order for the button to look as if its toggled on you must add the `toggledOn` class. Should be a string of "true" or "false"
- Toggle buttons must have both the *toggleButton* class and the *animatedButton* class.
- The display name is put in the element.


**This is the robot side code** (Ours is in `robotContainer`)
```java
  private final ToggleButton *name = new ToggleButton(*topic, new *Command);
```


### Note for Action and Toggle buttons.


If for whatever reason you need a command to run when the button sends true and a different command for when the button is released or toggled off, use `DoubleActionButton`


```java
private final DoubleActionButton *name = new DoubleActionButton("*topic", new *onTrueCommand, new *offCommand);
```


### One shot Button
Here is a template of a **One Shot Button**.
```html
<button  class="oneShotButton *topic"  data-type="boolean"  data-topic="*topic" data-value="false">*name</button>
```
 - The data-type for buttons should always be boolean.
 - The data-topic attribute will publish the button's value to that topic on the network tables. (Each component must have a unique topic).
 - The data-value for one shot buttons should be false.
 - The data-topic name must be included in the class of the component for the animation to play. This is because the one shot button only animates once the robot sets the value to false. (This is so that the button is only animated if the value gets sent).
- The display name is put in the element.




**This is the robot side code** (Ours is in `robotContainer`)


```java
private final OneShotButton *name = new OneShotButton(*topic, new *Command)
```




### Axis Knob


Here is a template of a **Axis Knob**




```html
<div class="axis" data-topic="*topic" data-value="*axisInitalValue" data-type="double">
    <h1 class="axisLabel">*name</h1>
    <input class="axisKnob" type="range" min="*axisMinumum" max="*axisMaximum" step="*axisStepValue" value="*axisInitalValue">
</div>
```
- The data-type for axis should be double
- The data-topic attribute is what topic the value will be published to on network tables. (Each component must have a unique topic).
- The axis min and max values are self explanatory.
- The step value is the amount that the input can change by.
- The value is the initial value that the axis should have. When the axis is released the knob will snap back to this value.
- The name should be in the axis label.


- For a vertical axis, change the `axis` class to `verticalAxis` and the `axisKnob` class to `verticalAxisKnob`


**This is the robot side code, this is split into two parts, one sets the topic and the next sets the command.** (The first half of ours is in `robotContainer`, and the command setter is in `configureBindings()`)


```java
//Half One
private final AxisKnob *name = new AxisKnob("*topic");
//Second half
//Put the get value in the parameter that you the axis value to modify
//You can still put other parameters that your command may need.
//Remember the ()-> as it is a supplier.
*name.setCommand(()-> new *Command(*name.getValue()));
//Note, you do not have to set a command, if you want the value to be passed
//elsewhere do so, but note that there must be a supplier for the value to
//update.
```


### Dropdown
Here is a template of a **DropDown**


```html
<div class="select" data-value="*initalOption" data-topic="*topic" data-type="string">
    <h1 class="selectTitle">*initalOptionName</h1>
    <h1 class="selectOption" data-value="*initalOption">*initalOptionName</h1>
    <h1 class="selectOption" data-value="*optionValue">*optionName</h1>
    <h1 class="selectOption" data-value="*optionValue">*optionName</h1>
    ...
</div>
```
- The dropdown element lets the user switch between premade string values.
- The title is updated based on the selected value, but the initial value must be set properly
- The data-topic attribute is what topic the value will be published to on network tables. (Each component must have a unique topic).
- The data-type for dropdown should be string
- You can add as many options as you'd like.
- The data-value of the options is the string value that will be send
- The option name is what will be displayed on screen.


**This is the robot side code, this is split into two parts, one sets the topic and the next sets the command.** (The first half of ours is in `robotContainer`, and the command setter is in `configureBindings()`)
```java
//Half One
private final Dropdown *name = new Dropdown("*topic");
//Second half
//Put the get value in the parameter that you the axis value to modify
//You can still put other parameters that your command may need.
//Remember the ()-> as it is a supplier.
*name.setCommand(()-> new *Command(*name.getValue()));
//Note, you do not have to set a command, if you want the value to be passed
//elsewhere do so, but note that there must be a supplier for the value to
//update.
```


### Number Input
Here is a template of a **Number Input**


```html
<div class="numberComponent" data-topic='*topic' data-type="double" data-step="*stepValue" data-min="*minValue" data-max="*maxValue" data-value="*initalValue" data-persist="*boolean" >
    <p class="numberTitle">*name</p>
    <button class="numberMinus animatedButton">-</button>
    <input class="numberTextInput" type="number" value="*initalValue">
    <button class="numberPlus animatedButton">+</button>
</div>
```
- The number input has a parent div which wraps a addition, subtraction, and manual number input.
- The `numberTextInput` value and the `numberComponent` data-value must be equal. This sets the initial value.
- The min and max values are self explanatory.
- The step value is the amount that the input can change by.
- The data-type for Number Input should be double
- The data-persist sets whether or not the value should persist or reset when the app closes. Should be a string of "true" or "false"
- The layout should stay as shown.
- **Note that due to JS using floating point decimal math, the value may sometimes be 0.3000004** or something similar when using + and - Buttons with a step value less than 1 this value is too small to affect motor speed however.


**This is the robot side code, this is split into two parts, one sets the topic and the next sets the command.** (The first half of ours is in `robotContainer`, and the command setter is in `configureBindings()`)s  
```java
//Half One
private final NumberComponent *name = new NumberComponent("*topic");


//Second half
//Put the get value in the parameter that you the axis value to modify
//You can still put other parameters that your command may need.
//Remember the ()-> as it is a supplier.
*name.setCommand(()-> new *Command(*name.getValue()));
//Note, you do not have to set a command, if you want the value to be passed
//elsewhere do so, but note that there must be a supplier for the value to
//update.
```


### Basic Subscription


Here is a template of a **Basic Subscription**


```html
<div class="basicSubscription *fullTopicPath" data-topic="*fullTopicPath">
  <h1 class="bSTopic">*name</h1>
  <h1 class="bSValue">*initalValue</h1>
</div>
```
- Unlike other components, basic subscription starts at the root of network tables.
- The name can be set to anything
- Make sure that the full topic path is also in the classes.
- Note that basic subscriptions only update if the bot changes the value, they will not update if the touchboard changes the value. This is because the callback only executes when the robot sends a new value to the touchboard.


# Pose Plotter


Pose plotter is the optional auto builder that is in this project. It is able to send autos to the bot without needing to deploy code to make a new auto. This along with its quick ui allows you to make quick changes before a match starts, and simplifies the auto process. This auto builder creates a string from the ui and sends it to the robot, after the robot decodes the string and makes a command sequence from them.


To disable this feature simple comment out the tab in tabnav.


Note that the robots displayed path **will not** correspond to how the robot will move, It is for visual purposes.


You will see at the top a bar, this bar while house the auto commands ordered left to right, you can scroll, drag by clicking or tapping and holding, or remove by clicking or tapping quickly.


To the lower left you will see a field map, This has a movable starting position for the robot (doesn't do anything just for cosmetic purposes) and buttons which will add a command when clicked.


To the upper right you will see a bar holding a clear button with an X on it, a dropdown to save autos for later, and a send button with an ➦ that will send the string to the robot.


To set the next command, click on it in the commands tab. (Note a smaller view will be toggled when Commands text is clicked at the top). Notice the await and sync switcher at the top. If the switcher is on await before clicking the command, it will wait for the `isFinished()` of the command, If it is sync, it will execute itself and the next command at the same time (If the next is also sync after that will be run along with it). Once finished you can use the dropdown to name and save the auto. Press the send button to send the auto to the bot. (Your current auto will be saved and resent on refresh, but you must name and save it to use it later after a clear or different auto)


The auto you are working on will save when the window is closed or open or refreshed, but will only be sent when the send button is clicked, then it will be in a queue to be sent which will also persist.

## Pose Plotter setup

You must add commands, (see below), and then return the pose plotter auto in `getAutonomousCommand()`.

Simply replace your `getAutonomousCommand()` with the below code.

```java
  public Command getAutonomousCommand() {

    return posePlotterUtil.getAuto();
  }
```

## Adding commands


To add a command to the list, go to `./js/autoBuilder.js` and add to the command list array. The template is below


```js
    let commandList = [
      {
        name: '*name',
        value: '*value',
      },
    ]
```
To set the command to execute when the value is made, you must add a command pair for each command you add, and for the position buttons as well. We have ours in `robotContainer()`
The value should match what's in the command list, and the command must have `()->` since it is a command supplier. Ensure that the commands you add finish, otherwise they will be either stuck on the command or it will instantly finish.


```java
  posePlotterUtil.addCommandPair("*value", ()-> new *command);
```


**For robot movement during auto with the positioning buttons, we use pathplanners pathfinding command with a smaller navigation grid for accuracy. Your team may opt for a pathfind then path or autopilot instead. But if the movement system you use does not account for obsticles then your robot will crash if pathed through one.**


# Jukebox


An optional chrp player ui that lets you select from chrp files on your robot. To add them, put the cover art in the `coverArt` folder. Then add it to the `tracks` array in `jukebox.js`. Then make sure the file name matches the chrp in the deploy folder.


This is a template for a track in the tracks array:


```js
let tracks = [
    {
        name: "*displayedName",
        coverArtSRC: "./coverArt/*coverArtName",
        //Note that src is relative to the html file, NOT THIS FILE!!
        robotFileName: "*chrpOnRobot.chrp",
        played: false //This is for shuffle to work, must be included.
    },
]
```


To add talonfx motors to the jukebox, use the `.addTalon(*talonFx)` method. This will set the motor config to allow music during disable and add it to the orchestra.


**This is the robot side code** (Ours is in `robotContainer()`)


```java
    JukeboxUtil jukebox = new JukeboxUtil();
    jukebox.addTalon(*talonfx);
    jukebox.addTalon(*talonfx2);
    ...
```




## Building
This step isn't exactly 'necessary', since the app will run on the webpage just fine. But running a live server before every match is cumbersome, so we make a electron app to set everything for us. (Loading the index.html offline does not work due to CORS).


In order to build the app after customizing, you must run:
```
npm run make
```
This will create an automatic setup file in the out/make folder. This setup file needs to be run once, then the program will be installed and accessible through the start menu. **The version must be bumped in the package.json or the old version must be uninstalled before running a new setup file**.


There may be warnings about promisify and or a DeprecationWarning which can be ignored.
There may be an error in which the folder is locked, if so close all programs with that folder open and restart vscode.
