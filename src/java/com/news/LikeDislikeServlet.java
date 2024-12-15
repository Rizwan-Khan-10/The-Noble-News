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
import java.util.stream.Collectors;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

@WebServlet("/LikeDislikeServlet")
public class LikeDislikeServlet extends HttpServlet {

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        Gson gson = new Gson();
        JsonObject jsonResponse = new JsonObject();

        Connection conn = null;

        try {
            String jdbcURL = "jdbc:mysql://localhost:3306/user_login_db";
            String dbUser = "root";
            String dbPassword = "123456";

            Class.forName("com.mysql.cj.jdbc.Driver");
            conn = DriverManager.getConnection(jdbcURL, dbUser, dbPassword);

            String requestBody = request.getReader().lines().collect(Collectors.joining());
            JsonObject jsonRequest = gson.fromJson(requestBody, JsonObject.class);

            String username = jsonRequest.get("username").getAsString();
            String commentId = jsonRequest.get("commentId").getAsString();
            String type = jsonRequest.get("type").getAsString();

            PreparedStatement ps = conn.prepareStatement("SELECT likes, dislikes FROM comments WHERE id = ?");
            ps.setString(1, commentId);
            ResultSet commentRs = ps.executeQuery();

            int currentLikes = 0;
            int currentDislikes = 0;
            if (commentRs.next()) {
                currentLikes = commentRs.getInt("likes");
                currentDislikes = commentRs.getInt("dislikes");
            }

            String currentUserAction = null;
            ps = conn.prepareStatement("SELECT type FROM likedislike WHERE username = ? AND commentId = ?");
            ps.setString(1, username);
            ps.setString(2, commentId);
            ResultSet userActionRs = ps.executeQuery();
            if (userActionRs.next()) {
                currentUserAction = userActionRs.getString("type");
            }

            if (type.equals("like")) {
                if ("like".equals(currentUserAction)) {
                    currentLikes--;
                    ps = conn.prepareStatement("DELETE FROM likedislike WHERE username = ? AND commentId = ?");
                    ps.setString(1, username);
                    ps.setString(2, commentId);
                    ps.executeUpdate();
                } else if ("dislike".equals(currentUserAction)) {
                    currentDislikes--;
                    currentLikes++;
                    ps = conn.prepareStatement("UPDATE likedislike SET type = ? WHERE username = ? AND commentId = ?");
                    ps.setString(1, "like");
                    ps.setString(2, username);
                    ps.setString(3, commentId);
                    ps.executeUpdate();
                } else {
                    currentLikes++;
                    ps = conn.prepareStatement("INSERT INTO likedislike (username, commentId, type) VALUES (?, ?, ?)");
                    ps.setString(1, username);
                    ps.setString(2, commentId);
                    ps.setString(3, "like");
                    ps.executeUpdate();
                }
            } else if (type.equals("dislike")) {
                if ("dislike".equals(currentUserAction)) {
                    currentDislikes--;
                    ps = conn.prepareStatement("DELETE FROM likedislike WHERE username = ? AND commentId = ?");
                    ps.setString(1, username);
                    ps.setString(2, commentId);
                    ps.executeUpdate();
                } else if ("like".equals(currentUserAction)) {
                    currentLikes--;
                    currentDislikes++;
                    ps = conn.prepareStatement("UPDATE likedislike SET type = ? WHERE username = ? AND commentId = ?");
                    ps.setString(1, "dislike");
                    ps.setString(2, username);
                    ps.setString(3, commentId);
                    ps.executeUpdate();
                } else {
                    currentDislikes++;
                    ps = conn.prepareStatement("INSERT INTO likedislike (username, commentId, type) VALUES (?, ?, ?)");
                    ps.setString(1, username);
                    ps.setString(2, commentId);
                    ps.setString(3, "dislike");
                    ps.executeUpdate();
                }
            }

            if (type.equals("like-none") && currentUserAction != null) {
                if ("like".equals(currentUserAction)) {
                    currentLikes--;
                } else if ("dislike".equals(currentUserAction)) {
                    currentDislikes--;
                }
                ps = conn.prepareStatement("DELETE FROM likedislike WHERE username = ? AND commentId = ?");
                ps.setString(1, username);
                ps.setString(2, commentId);
                ps.executeUpdate();
            } else if (type.equals("dislike-none") && currentUserAction != null) {
                if ("like".equals(currentUserAction)) {
                    currentLikes--;
                } else if ("dislike".equals(currentUserAction)) {
                    currentDislikes--;
                }
                ps = conn.prepareStatement("DELETE FROM likedislike WHERE username = ? AND commentId = ?");
                ps.setString(1, username);
                ps.setString(2, commentId);
                ps.executeUpdate();
            }

            ps = conn.prepareStatement("UPDATE comments SET likes = ?, dislikes = ? WHERE id = ?");
            ps.setInt(1, currentLikes);
            ps.setInt(2, currentDislikes);
            ps.setString(3, commentId);
            ps.executeUpdate();

            jsonResponse.addProperty("status", "success");
            jsonResponse.addProperty("likes", currentLikes);
            jsonResponse.addProperty("dislikes", currentDislikes);

        } catch (Exception e) {
            e.printStackTrace();
            jsonResponse.addProperty("status", "error");
            jsonResponse.addProperty("message", e.getMessage());
        } finally {
            if (conn != null) {
                try {
                    conn.close();
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
            out.print(gson.toJson(jsonResponse));
            out.flush();
            out.close();
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String username = request.getParameter("username");
        String fetchLikesDislikesSql = "SELECT commentId, type FROM likedislike WHERE username = ?";

        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        Gson gson = new Gson();
        JsonObject responseJson = new JsonObject();

        try {
            Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/user_login_db", "root", "123456");
            PreparedStatement stmt = conn.prepareStatement(fetchLikesDislikesSql);
            stmt.setString(1, username);
            ResultSet rs = stmt.executeQuery();

            JsonObject likesDislikes = new JsonObject();

            while (rs.next()) {
                String commentId = rs.getString("commentId");
                String type = rs.getString("type");
                likesDislikes.addProperty(commentId, type);
            }

            responseJson.add("likesdislikes", likesDislikes);
            responseJson.addProperty("status", "success");
        } catch (Exception e) {
            responseJson.addProperty("status", "error");
            responseJson.addProperty("message", "Server error: " + e.getMessage());
            e.printStackTrace();
        }

        out.print(gson.toJson(responseJson));
        out.flush();
    }
}
