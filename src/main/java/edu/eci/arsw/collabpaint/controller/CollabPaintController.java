/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package edu.eci.arsw.collabpaint.controller;

import edu.eci.arsw.collabpaint.model.Point;
import java.util.ArrayList;
import java.util.HashMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

/**
 *
 * @author camilo
 */
@Controller
public class CollabPaintController {

    private Integer numDibujo;
    private HashMap<Integer, ArrayList<Point>> hashPoints = new HashMap<>();
    
    @Autowired
    SimpMessagingTemplate msgt;

    @MessageMapping("/newpoint.{numdibujo}")
    public synchronized void handlePointEvent(Point pt, @DestinationVariable String numdibujo) throws Exception {
        
        numDibujo = Integer.parseInt(numdibujo);
        
        if(hashPoints.containsKey(numDibujo)){
            hashPoints.get(numDibujo).add(pt);
        } else{
            ArrayList<Point> arrayToAdd = new ArrayList<>();
            hashPoints.put(numDibujo, arrayToAdd);
        }
        
        if(hashPoints.get(numDibujo).size() < 4){
            msgt.convertAndSend("/topic/newpoint." + numDibujo, pt);
        } else{
            msgt.convertAndSend("/topic/newpoint." + numDibujo, pt);
            msgt.convertAndSend("/topic/newpolygon." + numDibujo, hashPoints.get(numDibujo));
            hashPoints.get(numDibujo).clear();
        }           
    }
}
