/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */
package com.news;

import java.io.BufferedReader;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.gson.Gson;

@WebServlet("/NewsServlet")
public class NewsServlet extends HttpServlet {

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        BufferedReader reader = request.getReader();
        Gson gson = new Gson();
        NewsData newsData = gson.fromJson(reader, NewsData.class);

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            Connection con = DriverManager.getConnection("jdbc:mysql://localhost:3306/user_login_db", "root", "123456");

            String query = "INSERT INTO saved_news (email, title, img, source, description) VALUES (?, ?, ?, ?, ?)";
            PreparedStatement ps = con.prepareStatement(query);
            ps.setString(1, newsData.getEmail());
            ps.setString(2, newsData.getTitle());
            ps.setString(3, newsData.getImg());
            ps.setString(4, newsData.getSource());
            ps.setString(5, newsData.getDesc());

            int result = ps.executeUpdate();
            ps.close();
            con.close();
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            if (result > 0) {
                response.getWriter().write("{\"success\": true}");
            } else {
                response.getWriter().write("{\"success\": false}");
            }

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"success\": false}");
        }
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String email = request.getParameter("email");
        List<NewsData> savedNews = new ArrayList<>();

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            Connection con = DriverManager.getConnection("jdbc:mysql://localhost:3306/user_login_db", "root", "123456");

            String query = "SELECT * FROM saved_news WHERE email = ?";
            PreparedStatement ps = con.prepareStatement(query);
            ps.setString(1, email);

            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                NewsData news = new NewsData();
                news.setEmail(rs.getString("email"));
                news.setTitle(rs.getString("title"));
                news.setImg(rs.getString("img"));
                news.setSource(rs.getString("source"));
                news.setDesc(rs.getString("description"));
                savedNews.add(news);
            }

            ps.close();
            con.close();

            Gson gson = new Gson();
            String jsonResponse = gson.toJson(savedNews);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(jsonResponse);

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        BufferedReader reader = request.getReader();
        Gson gson = new Gson();
        NewsData newsData = gson.fromJson(reader, NewsData.class);

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            Connection con = DriverManager.getConnection("jdbc:mysql://localhost:3306/user_login_db", "root", "123456");

            String query = "DELETE FROM saved_news WHERE email = ? AND title = ?";
            PreparedStatement ps = con.prepareStatement(query);
            ps.setString(1, newsData.getEmail());
            ps.setString(2, newsData.getTitle());

            int result = ps.executeUpdate();
            ps.close();
            con.close();

            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            if (result > 0) {
                response.getWriter().write("{\"success\": true}");
            } else {
                response.getWriter().write("{\"success\": false}");
            }

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"success\": false}");
        }
    }

    class NewsData {
        private String email;
        private String img;
        private String title;
        private String source;
        private String desc;

        // Getters and setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getImg() { return img; }
        public void setImg(String img) { this.img = img; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getSource() { return source; }
        public void setSource(String source) { this.source = source; }
        public String getDesc() { return desc; }
        public void setDesc(String desc) { this.desc = desc; }
    }
}
