package com.example.todo;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    private final TaskRepository taskRepository;

    public TaskController(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @GetMapping
    public List<Task> getTasks(@RequestParam String username) {
        return taskRepository.findByUsernameOrderByDeadlineAsc(username);
    }

    @PostMapping
    public ResponseEntity<?> addTask(@RequestBody Task task) {
        if (task.getUsername() == null || task.getUsername().isBlank()) {
            return ResponseEntity.badRequest().body("Username is required");
        }

        if (task.getTitle() == null || task.getTitle().isBlank()) {
            return ResponseEntity.badRequest().body("Task title is required");
        }

        if (task.getPriority() == null || task.getPriority().isBlank()) {
            task.setPriority("MEDIUM");
        }

        if (task.getCategory() == null || task.getCategory().isBlank()) {
            task.setCategory("General");
        }

        if (task.getRecurrence() == null || task.getRecurrence().isBlank()) {
            task.setRecurrence("NONE");
        }

        return ResponseEntity.ok(taskRepository.save(task));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(
            @PathVariable Long id,
            @RequestParam String username,
            @RequestBody Task updatedTask) {

        return taskRepository.findById(id)
                .filter(task -> task.getUsername().equals(username))
                .map(task -> {
                    task.setTitle(updatedTask.getTitle());
                    task.setDescription(updatedTask.getDescription());
                    task.setDeadline(updatedTask.getDeadline());
                    task.setPriority(updatedTask.getPriority());
                    task.setCategory(updatedTask.getCategory());
                    task.setCompleted(updatedTask.isCompleted());
                    task.setDailyRoutine(updatedTask.isDailyRoutine());
                    task.setRecurrence(updatedTask.getRecurrence());
                    return ResponseEntity.ok(taskRepository.save(task));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(
            @PathVariable Long id,
            @RequestParam String username) {

        return taskRepository.findById(id)
                .filter(task -> task.getUsername().equals(username))
                .map(task -> {
                    taskRepository.delete(task);
                    return ResponseEntity.ok("Task deleted successfully");
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
