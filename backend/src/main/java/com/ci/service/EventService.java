package com.ci.service;

import com.ci.model.Event;
import com.ci.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;

    public Page<Event> getRecentEvents(Pageable pageable) {
        return eventRepository.findAllByOrderByCreatedAtDesc(pageable);
    }
    
    public Event createEvent(Event.EventType type, Long customerId, Long predictionId, String message) {
        Event event = Event.builder()
                .type(type)
                .customerId(customerId)
                .predictionId(predictionId)
                .message(message)
                .build();
        return eventRepository.save(event);
    }
}
