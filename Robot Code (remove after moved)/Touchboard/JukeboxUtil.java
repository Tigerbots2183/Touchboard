// Copyright (c) FIRST and other WPILib contributors.
// Open Source Software; you can modify and/or share it under the terms of
// the WPILib BSD license file in the root directory of this project.

package frc.robot.subsystems.Touchboard;


import com.ctre.phoenix6.Orchestra;
import com.ctre.phoenix6.configs.AudioConfigs;
import com.ctre.phoenix6.hardware.TalonFX;

import edu.wpi.first.networktables.BooleanPublisher;
import edu.wpi.first.networktables.BooleanSubscriber;
import edu.wpi.first.networktables.NetworkTable;
import edu.wpi.first.networktables.NetworkTableInstance;
import edu.wpi.first.networktables.StringSubscriber;
import edu.wpi.first.wpilibj2.command.SubsystemBase;

public class JukeboxUtil extends SubsystemBase {
  /** Creates a new JukeboxUtil. */

  private Orchestra mOrchestra = new Orchestra();
  private AudioConfigs configs = new AudioConfigs();

  final BooleanSubscriber newFileSubscriber;
  final BooleanPublisher newFilePublisher;
  
  final BooleanSubscriber stopSubscriber;
  final BooleanPublisher stopPublisher;

  final BooleanSubscriber pauseSubscriber;
  final BooleanPublisher pausePublisher;

  final BooleanSubscriber playSubscriber;
  final BooleanPublisher playPublisher;

  final BooleanSubscriber restartSubscriber;
  final BooleanPublisher restartPublisher;
  
  final BooleanSubscriber musicIsFinishedSubscriber;
  final BooleanPublisher musicIsFinishedPublisher;

  final BooleanSubscriber nextSongSubscriber;
  final BooleanPublisher nextSongPublisher;

  private Boolean prev = false;
  
  final StringSubscriber currentMusicFileSubscriber;

  public JukeboxUtil() {
    NetworkTableInstance inst = NetworkTableInstance.getDefault();
    NetworkTable datatable = inst.getTable("touchboard");

    currentMusicFileSubscriber = datatable.getStringTopic("currentMusicFile").subscribe("");

    newFilePublisher =  datatable.getBooleanTopic("newFile").publish();
    newFileSubscriber = datatable.getBooleanTopic("newFile").subscribe(false);

    stopPublisher =  datatable.getBooleanTopic("stopMusic").publish();
    stopSubscriber = datatable.getBooleanTopic("stopMusic").subscribe(false);

    pausePublisher =  datatable.getBooleanTopic("pauseMusic").publish();
    pauseSubscriber = datatable.getBooleanTopic("pauseMusic").subscribe(false);

    playPublisher =  datatable.getBooleanTopic("playMusic").publish();
    playSubscriber = datatable.getBooleanTopic("playMusic").subscribe(false);

    restartPublisher =  datatable.getBooleanTopic("restartMusic").publish();
    restartSubscriber = datatable.getBooleanTopic("restartMusic").subscribe(false);
    
    musicIsFinishedPublisher = datatable.getBooleanTopic("musicIsFinished").publish();
    musicIsFinishedSubscriber = datatable.getBooleanTopic("musicIsFinished").subscribe(false);

    nextSongPublisher =  datatable.getBooleanTopic("goToNextSong").publish();
    nextSongSubscriber = datatable.getBooleanTopic("goToNextSong").subscribe(false);

  }

 
  public void addTalon(TalonFX newMotor){
    //Sets config and adds to orchestra
    configs.AllowMusicDurDisable = true;
    newMotor.getConfigurator().apply(configs);
    mOrchestra.addInstrument(newMotor);
  }


  @Override
  public void periodic() {

    if(newFileSubscriber.get()){
      mOrchestra.loadMusic(currentMusicFileSubscriber.get());
      mOrchestra.play();
      musicIsFinishedPublisher.set(false);
      
      newFilePublisher.set(false);
      System.out.println("fileLoaded");
      System.out.println(currentMusicFileSubscriber.get());
      prev = false;
    }

    if(stopSubscriber.get()){
      mOrchestra.stop();
      stopPublisher.set(false);
      System.out.println("MusicStopped");
    }

    if(pauseSubscriber.get()){
      mOrchestra.pause();
      pausePublisher.set(false);
      System.out.println("MusicPaused");

    }

    if(playSubscriber.get()){
      mOrchestra.play();
      playPublisher.set(false);
      System.out.println("MusicPlayed");
    }

    if(restartSubscriber.get()){
      mOrchestra.loadMusic(currentMusicFileSubscriber.get());
      mOrchestra.play();
      System.out.println("restarted");
      restartPublisher.set(false);
    }

    if(mOrchestra.isPlaying() == false && prev == false && nextSongSubscriber.get()){
      musicIsFinishedPublisher.set(true);
      System.out.println("Music Finished");
      prev = true;
    }
  }
}
