/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */
package com.news;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import java.util.UUID;

@WebServlet("/CommentsServlet")
public class CommentsServlet extends HttpServlet {

    private Connection connect() {
        String jdbcURL = "jdbc:mysql://localhost:3306/user_login_db";
        String dbUser = "root";
        String dbPassword = "123456";
        Connection conn = null;
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            conn = DriverManager.getConnection(jdbcURL, dbUser, dbPassword);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return conn;
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String url = request.getParameter("url");
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        if (url != null && !url.isEmpty()) {
            try (Connection conn = connect()) {
                String sql = "SELECT id, username, comment, comment_date, likes, dislikes, email FROM comments WHERE url = ?";
                PreparedStatement stmt = conn.prepareStatement(sql);
                stmt.setString(1, url);
                ResultSet rs = stmt.executeQuery();

                List<Map<String, Object>> comments = new ArrayList<>();
                while (rs.next()) {
                    Map<String, Object> commentData = new HashMap<>();
                    commentData.put("email", rs.getString("email"));
                    commentData.put("id", rs.getString("id"));
                    commentData.put("username", rs.getString("username"));
                    commentData.put("comment", rs.getString("comment"));
                    commentData.put("date", rs.getString("comment_date"));
                    commentData.put("thumbsUpCount", rs.getInt("likes"));
                    commentData.put("thumbsDownCount", rs.getInt("dislikes"));
                    comments.add(commentData);
                }

                JsonObject json = new JsonObject();
                if (comments.isEmpty()) {
                    json.addProperty("status", "no_comments");
                    json.addProperty("message", "No comments so far. Dare to share your opinion?");
                } else {
                    Gson gson = new Gson();
                    json.addProperty("status", "success");
                    json.add("comments", gson.toJsonTree(comments));
                }
                out.println(json.toString());
            } catch (SQLException e) {
                e.printStackTrace();
                JsonObject json = new JsonObject();
                json.addProperty("status", "error");
                json.addProperty("message", "Internal server error: " + e.getMessage());
                out.println(json.toString());
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            }
        } else {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.println("{\"status\": \"error\", \"message\": \"URL parameter is missing.\"}");
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        Gson gson = new Gson();
        JsonObject requestData = gson.fromJson(request.getReader(), JsonObject.class);
        String email = requestData.get("email") != null ? requestData.get("email").getAsString() : null;
        String url = requestData.get("url") != null ? requestData.get("url").getAsString() : null;
        String comment = requestData.get("comment") != null ? requestData.get("comment").getAsString() : null;

        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        if (email != null && url != null && comment != null) {
            try (Connection conn = connect()) {
                String fetchUsernameSql = "SELECT username FROM users WHERE email = ?";
                PreparedStatement fetchStmt = conn.prepareStatement(fetchUsernameSql);
                fetchStmt.setString(1, email);
                ResultSet rs = fetchStmt.executeQuery();

                if (rs.next()) {
                    String username = rs.getString("username");

                    String commentId = UUID.randomUUID().toString();

                    String insertCommentSql = "INSERT INTO comments (id, username, url, comment, comment_date, email) VALUES (?, ?, ?, ?, ?, ?)";
                    PreparedStatement insertStmt = conn.prepareStatement(insertCommentSql);

                    insertStmt.setString(1, commentId);
                    insertStmt.setString(2, username);
                    insertStmt.setString(3, url);
                    insertStmt.setString(4, comment);
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                    String currentDate = sdf.format(new java.util.Date());
                    insertStmt.setString(5, currentDate);
                    insertStmt.setString(6, email);

                    int rowsInserted = insertStmt.executeUpdate();
                    JsonObject json = new JsonObject();
                    if (rowsInserted > 0) {
                        json.addProperty("status", "success");
                        json.addProperty("message", "Comment added successfully.");
                    } else {
                        json.addProperty("status", "error");
                        json.addProperty("message", "Failed to add comment.");
                    }
                    out.println(json.toString());
                } else {
                    JsonObject json = new JsonObject();
                    json.addProperty("status", "error");
                    json.addProperty("message", "User not found for the given email.");
                    out.println(json.toString());
                }
            } catch (SQLException e) {
                e.printStackTrace();
                JsonObject json = new JsonObject();
                json.addProperty("status", "error");
                json.addProperty("message", "Server error: " + e.getMessage());
                out.println(json.toString());
            }
        } else {
            JsonObject json = new JsonObject();
            json.addProperty("status", "error");
            json.addProperty("message", "Invalid request parameters.");
            out.println(json.toString());
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String commentId = request.getParameter("commentId");
        String email = request.getParameter("email");

        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        if (commentId != null && email != null) {
            try (Connection conn = connect()) {
                String fetchCommentSql = "SELECT id FROM comments WHERE id = ? AND email = ?";
                PreparedStatement fetchStmt = conn.prepareStatement(fetchCommentSql);
                fetchStmt.setString(1, commentId);
                fetchStmt.setString(2, email);
                ResultSet rs = fetchStmt.executeQuery();

                if (rs.next()) {
                    String deleteCommentSql = "DELETE FROM comments WHERE id = ?";
                    PreparedStatement deleteStmt = conn.prepareStatement(deleteCommentSql);
                    deleteStmt.setString(1, commentId);
                    int rowsDeleted = deleteStmt.executeUpdate();

                    JsonObject json = new JsonObject();
                    if (rowsDeleted > 0) {
                        String deleteLikeDislikeSql = "DELETE FROM likedislike WHERE commentId = ?";
                        PreparedStatement deleteLikeDislikeStmt = conn.prepareStatement(deleteLikeDislikeSql);
                        deleteLikeDislikeStmt.setString(1, commentId);
                        deleteLikeDislikeStmt.executeUpdate();

                        json.addProperty("status", "success");
                        json.addProperty("message", "Comment and associated likes/dislikes deleted successfully.");
                    } else {
                        json.addProperty("status", "error");
                        json.addProperty("message", "Failed to delete comment.");
                    }
                    out.println(json.toString());
                } else {
                    JsonObject json = new JsonObject();
                    json.addProperty("status", "error");
                    json.addProperty("message", "No comment found for the given user and comment ID.");
                    out.println(json.toString());
                }
            } catch (SQLException e) {
                e.printStackTrace();
                JsonObject json = new JsonObject();
                json.addProperty("status", "error");
                json.addProperty("message", "Server error: " + e.getMessage());
                out.println(json.toString());
            }
        } else {
            JsonObject json = new JsonObject();
            json.addProperty("status", "error");
            json.addProperty("message", "Invalid request parameters.");
            out.println(json.toString());
        }
    }
}