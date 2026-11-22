# 2.5.0
- Added Graph Component
    - A custom gpu accelerated graph drawer with zooming and panning on both axis, took forever to make. 

- Added Color Coder Component
    - This component allows you to set colors for predefined values.

- Added Support for WPILIB 2027 Alpha, No command v3 support just yet, but it is in the works

- Added support for the Tunable API for WPILIB 2027
    - Sendable Chooser Support has been added
    - Boolean and Double tunable values can be edited with output components

- Added data validation to Axis Component
    - Currently only the axis has data validation, as the value changes could be faster then the callback could respond too. If others become an issue I can add data validation there too.

- Added an option that determines whether the inital value should be sent when the dashboard is connected and or when teleop is enabled, or to only send the first value when it is changed by the user. 
    - For example, if you wanted a number component to send a value when the robot is enabled, then the Auto Trigger Binders option should be enabled. But if you had an opt group that determined the level of an elevator, you may want to disable Auto Trigger Binders as it would move the elevator automatically when the robot is enabled. Up to you. 

- ButtonOptGroup and Dropdown components now are able to have names.

- Output components now react to each other and changes in value from the robot. 
    - If there are two axis components on the same topic for example, you will see them both react to your input, or changes from the robot. 

- Struct decodation is now up to spec
    - The old version I coded didnt support most of the struct spec, it is now up to spec, besides struct arrays

- Components now batch render data changes
    - Components used to cause a full page render every time their value was updated indivdually, this caused constant page reflow and terrible preformance

- New mobile ui
    - Vertical mobile ui has been added, this ui has some compromises, with the top tab bar being moved to the side, so visible and minimized tabs appear the same on mobile. Fully functional on chrome mobile.

- Bandwidth has been majorly reduced
    - Topics now only share their name until you make a component with them

- Robot library overhaul (Commands v3 library in the works)
    - Robot library has been overhauled to use proxy commands instead of manual command scheduling and canceling workaound. 
    - A 2027 version of the library has been made and tested with Alpha 7 for commands v2. 

- Camera now shows ⌛ when it is on cooldown before automatically stopping the recording
    - The camera waits 8 seconds before downloading and stopping a recording in case the robot is in transition time from auto to teleop. Now during that time ⌛ is shown. 

- Dashboard no longer refereshes until connection

- Optgroup buttons now resize when fill is enabled

- Fixed inconsitensies how components send their values on default

- Fixed an issue with components only binding on connection to the robot

- Fixed an issue where values published by touchboard could not be viewed in touchboard

- Fixed an issue where the grid underlay duplicated when the editor menu was opened

- Fixed an issue where selecting a new topic for a output component displayed unsupported types for that component

- Fixed an issue with number lines tick values rounding

- Fixed an issue with number line values not saving

- Fixed an issue where topics that didnt have "/" at the start were not displayed

- Fixed an issue where the dropdown component would select a value when trying to open it

# 2.1.0

- Added Camera Stream Component
    - The camera can show streams from the robot, and record them as well. The videos will be downloaded to your downloads folder 7 seconds after the match is over. 

- Fixed Radial Gauge ticks rounding (Numberline rounds currently but cannot be changed until component gets overhauled)
