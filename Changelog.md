# 2.5.0

- Added Graph Component
    - The graph was the largest addition, it is a custom gpu accelerated graph drawer. Custom interface for the graph, with zooming and panning on both axis 

- Added Color Coder Component
    - This component allows you to set colors for predefined values.

- Struct decoder refactor
    - The old version I coded didnt support most of the struct spec, it is now up to spec, besides struct arrays

- Components now batch render data changes
    - Components used to cause a full page render every time their value was updated indivdually, this caused constant page reflow and terrible preformance

- New mobile ui
    - Vertical mobile ui has been added, this ui has some compromises, with the top tab bar being moved to the side, so visible and minimized tabs appear the same on mobile. Fully functional on chrome mobile.

- Bandwidth has been majorly reduced
    - Topics now only share their name until you make a component with them

- Robot library overhaul (Commands v3 library in the works)
    - Robot library has been overhauled to use proxy commands instead of manual command scheduling and canceling workaound. 

# 2.1.0

- Added Camera Stream Component
    - The camera can show streams from the robot, and record them as well. The videos will be downloaded to your downloads folder 7 seconds after the match is over. 

- Fixed Radial Gauge ticks rounding (Numberline rounds currently but cannot be changed until component gets overhauled)
