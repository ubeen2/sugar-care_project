package com.example.demo.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;


import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class ScrapController {

    private final RestTemplate restTemplate = new RestTemplate();
    //private final String FASTAPI_URL = "http://localhost:8000";  // FastAPI 서버 주소
    private final String FASTAPI_URL = "http://127.0.0.1:8000";

    @GetMapping("/hello")
    public ResponseEntity<String> getHello() {
        // FastAPI 서버 호출
        String url = "http://localhost:8000/hello";
        String response = restTemplate.getForObject(url, String.class);

        return ResponseEntity.ok(response);
    }


    @GetMapping("/geocode")
    public ResponseEntity<?> geocode(@RequestParam String q) {
        try {

            System.out.println("[geocode] q =" + q);
            String url = FASTAPI_URL + "/api/geocode?q=" + q;
            Map response = restTemplate.getForObject(url, Map.class);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println(e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> search(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "전체") String category,
            @RequestParam(defaultValue = "accuracy") String sort,
            @RequestParam(defaultValue = "3") int radius_km
    ) {
        try {

            System.out.println("[search]");
            String url = String.format(
                    FASTAPI_URL + "/api/search?lat=%f&lon=%f&category=%s&sort=%s&radius_km=%d",
                    lat, lon, category, sort, radius_km
            );
            Map response = restTemplate.getForObject(url, Map.class);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println(e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping(value = "/recommend", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> recommend(
            @RequestParam(name = "category", defaultValue = "") String category,
            @RequestParam(name = "user_id", defaultValue = "anon") String userId,
            @RequestParam(name = "limit", defaultValue = "10") int limit
    ) {

        String url = UriComponentsBuilder.fromHttpUrl(FASTAPI_URL)
                .path("/api/recommend")
                .queryParam("category", category)
                .queryParam("user_id", userId)
                .queryParam("limit", limit)
                .build()
                .toUriString();


        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
        return ResponseEntity.status(response.getStatusCode())
                .contentType(MediaType.APPLICATION_JSON)
                .body(response.getBody());
    }

    @GetMapping(value = "/products", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> products(
            @RequestParam(name = "q", defaultValue = "저당식품") String q,
            @RequestParam(name = "category", defaultValue = "") String category
    ) {
        String url = UriComponentsBuilder.fromHttpUrl(FASTAPI_URL)
                .path("/api/products")
                .queryParam("q", q)
                .queryParam("category", category)
                .build()
                .toUriString();

        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
        return ResponseEntity.status(response.getStatusCode())
                .contentType(MediaType.APPLICATION_JSON)
                .body(response.getBody());
    }

    @PostMapping(value = "/track", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> track(@RequestBody Map<String, Object> payload) {
        String url = FASTAPI_URL + "/api/track";
        ResponseEntity<String> response = restTemplate.postForEntity(url, payload, String.class);
        return ResponseEntity.status(response.getStatusCode())
                .contentType(MediaType.APPLICATION_JSON)
                .body(response.getBody());
    }

}