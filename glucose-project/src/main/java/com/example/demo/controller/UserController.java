package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional; // 추가 (251010)


@RestController
@RequestMapping("/user")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/join")
    public void join(@RequestBody User user){
        System.out.println("아이디: " + user.getUserId());
        System.out.println("비밀번호: " + user.getPassword());
        System.out.println("이름: " + user.getUserName());
        System.out.println("혈당 관련 질병 유무: " + user.getUserType());
        System.out.println("보호자 : "+ user.getGuardianUserId());
        userRepository.save(user);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User req){
        System.out.println(req.getUserId());
        System.out.println(req.getPassword());
        return userRepository.findByUserId(req.getUserId())
                .map(user -> {
                    // 비밀번호 검증
                    if (user.getPassword().equals(req.getPassword())) {
                        Map<String, Object> profile = new HashMap<>();

                        // add (251010) - 프로필에 데이터를 집어넣음
                        profile.put("userId", user.getUserId());
                        profile.put("userName", user.getUserName());
                        profile.put("password", user.getPassword());
                        profile.put("guardianUserId", user.getGuardianUserId());
                        profile.put("userType", user.getUserType());
                        profile.put("height",user.getHeight());
                        profile.put("weight",user.getWeight());
                        profile.put("age",user.getAge());
                        profile.put("gender",user.getGender());
                        System.out.println("사용자 이름"+user.getUserName());
                        return ResponseEntity.ok(profile);
                    } else {
                        System.out.println("비밀번호 오류");
                        return ResponseEntity.status(401).body("비밀번호가 올바르지 않습니다");
                    }
                })
                .orElseGet(() ->                        ResponseEntity.status(401).body("아이디가 존재하지 않습니다"));
    }

    // 추가 (251010)
    @GetMapping("/detail/{userId}")
    public ResponseEntity<?> getUserDetail(@PathVariable String userId) {
        Optional<User> user = userRepository.findById(userId);
        return user.isPresent()
                ? ResponseEntity.ok(user.get())
                : ResponseEntity.status(404).body("User not found");
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateUser(@RequestBody User updatedUser) {
        Optional<User> existing = userRepository.findById(updatedUser.getUserId());
        if (existing.isPresent()) {
            userRepository.save(updatedUser);
            return ResponseEntity.ok("User updated successfully");
        } else {
            return ResponseEntity.status(404).body("User not found");
        }
    }
}
