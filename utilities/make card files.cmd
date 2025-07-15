@echo off
setlocal

:: Define the name of the folder to be created
set "folderName=Badge_PNGs"

:: Create the folder if it doesn't already exist
if not exist "%folderName%" (
    echo Creating folder: %folderName%
    mkdir "%folderName%"
) else (
    echo Folder '%folderName%' already exists.
)

echo.
echo Creating empty .png files...
echo.

:: Change the current directory to the new folder
cd "%folderName%"

:: Loop through the list of names and create an empty .png file for each one.
:: The 'type nul > "filename"' command is a standard way to create an empty (0-byte) file.
for %%F in (
    ACROBATIC_FINISH
    ALLEY_OOP
    ALTER_THE_SHOT
    ANCHOR_THE_DEFENSE
    AND_1
    ANKLE_BREAKER
    ANTICIPATE_THE_CUT
    ASSIST_CHAIN
    BAIL_OUT_PASS
    BASELINE_DRIVE
    BLOCK_PARTY
    BOUNCE_PASS
    BOX_OUT
    CATCH_AND_SHOOT
    CHASE_DOWN_BLOCK
    CLAMP_GOD
    CLOSE_THE_GAP
    CLOSEOUT
    CLUTCH_SHOOTING
    COMMUNICATE
    CONTACT_FINISH
    CONTEST_SHOT
    CORNER_SPECIALIST
    COURT_VISION
    CROSSOVER
    CUT_OFF_THE_DRIVE
    DEADEYE
    DEFENSIVE_STANCE
    DENY_THE_BALL
    DIME
    DRAW_THE_CHARGE
    DRIVE_AND_DISH
    DRIVE_TO_BASKET
    EURO_STEP
    EXPLOSIVE_FIRST_STEP
    FADEAWAY
    FAST_HANDS
    FEARLESS_FINISHER
    FIFTH_GEAR
    FIGHT_THROUGH_SCREEN
    FLOATER
    FLOOR_GENERAL
    FORCE_THE_EXTRA_PASS
    FORCE_THE_TURNOVER
    FOUR_POINT_PLAY
    FULL_COURT_PRESS
    GET_TO_THE_LINE
    GIVE_AND_GO
    GLITCH_IN_THE_SYSTEM
    GREEN_LIGHT
    HANG_TIME
    HEAT_CHECK
    HEDGE_THE_SCREEN
    HOP_STEP
    HOT_STREAK
    INTERCEPT
    INTIMIDATOR
    LATERAL_QUICKNESS
    LIMITLESS_RANGE
    LOB_PASS
    MENTAL_WARFARE
    NO_EASY_BUCKETS
    NO_LOOK_PASS
    OFF_BALL_SCREEN
    OUTLET_PASS
    PACE_SETTER
    PAINT_PATROL
    PERIMETER_LOCKDOWN
    PICK_AND_ROLL_MAESTRO
    PICK_POCKET
    PIN_THE_BALL
    POKE_THE_BALL_LOOSE
    POSTERIZER_DUNK
    PRESSURE_THE_PASSER
    PULL_UP_JUMPER
    PUMP_FAKE
    QUICK_PASS
    QUICK_RIP
    QUICK_SHOT
    READ_THE_PASSING_LANES
    READ_THE_PLAY
    REBOUND_MACHINE
    RELENTLESS_ASSAULT
    RHYTHM_DRIBBLE
    SECOND_CHANCE_DENIAL
    SHOWTIME_CHAIN
    SPIN_CYCLE
    SPOT_UP_SHOOTER
    STAY_IN_FRONT
    STEP_BACK_JUMPER
    SWAT
    SWITCH_EVERYTHING
    TAKE_THE_CHARGE
    THE_LOCKDOWN
    THREE_POINTER
    TIP_THE_PASS
    TIRELESS_DEFENDER
    TOUGH_CONTEST
    TRIPLE_THREAT
    VERTICALITY
    VICIOUS_BLOCK
    WALL_OFF_THE_PAINT
    WRAPAROUND_PASS
    WRECKING_BALL
) do (
    echo Creating %%F.png
    type nul > "%%F.png"
)

echo.
echo =======================================================
echo Done. All files have been created in the '%folderName%' folder.
echo =======================================================
echo.
pause