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
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

@WebServlet("/UserServlet")
public class UserServlet extends HttpServlet {

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

    public class EncryptionUtil {

        private static final String ALGO = "AES";
        private static final byte[] keyValue = new byte[]{
            'T', 'h', 'e', 'B', 'e', 's', 't', 'S', 'e', 'c', 'r', 'e', 't', 'K', 'e', 'y'
        };

        public static String encrypt(String Data) throws Exception {
            SecretKeySpec key = new SecretKeySpec(keyValue, ALGO);
            Cipher c = Cipher.getInstance(ALGO);
            c.init(Cipher.ENCRYPT_MODE, key);
            byte[] encVal = c.doFinal(Data.getBytes());
            return Base64.getEncoder().encodeToString(encVal);
        }

        public static String decrypt(String encryptedData) throws Exception {
            SecretKeySpec key = new SecretKeySpec(keyValue, ALGO);
            Cipher c = Cipher.getInstance(ALGO);
            c.init(Cipher.DECRYPT_MODE, key);
            byte[] decodedValue = Base64.getDecoder().decode(encryptedData);
            byte[] decValue = c.doFinal(decodedValue);
            return new String(decValue);
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String action = request.getParameter("action");
        PrintWriter out = response.getWriter();

        try {
            if ("register".equals(action)) {
                registerUser(request, response, out);
            } else if ("login".equals(action)) {
                loginUser(request, response, out);
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.println("{\"status\": \"error\", \"message\": \"An error occurred: " + e.getMessage() + "\"}");
        }
    }

    private void registerUser(HttpServletRequest request, HttpServletResponse response, PrintWriter out) throws Exception {
        String username = request.getParameter("register-username");
        String email = request.getParameter("register-email");
        String password = request.getParameter("register-password");

        try (Connection conn = connect()) {
            String checkEmailSql = "SELECT * FROM users WHERE email = ?";
            PreparedStatement checkEmailStmt = conn.prepareStatement(checkEmailSql);
            checkEmailStmt.setString(1, email);
            ResultSet emailResult = checkEmailStmt.executeQuery();

            if (emailResult.next()) {
                out.println("{\"status\": \"error\", \"message\": \"Email already registered. Please use a different email.\"}");
            } else {
                String checkUsernameSql = "SELECT * FROM users WHERE username = ?";
                PreparedStatement checkUsernameStmt = conn.prepareStatement(checkUsernameSql);
                checkUsernameStmt.setString(1, username);
                ResultSet usernameResult = checkUsernameStmt.executeQuery();

                if (usernameResult.next()) {
                    out.println("{\"status\": \"error\", \"message\": \"Username already exists. Please choose a different username.\"}");
                } else {
                    String encryptedPassword = EncryptionUtil.encrypt(password);
                    String insertSql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
                    PreparedStatement insertStmt = conn.prepareStatement(insertSql);
                    insertStmt.setString(1, username);
                    insertStmt.setString(2, email);
                    insertStmt.setString(3, encryptedPassword);

                    int rowsInserted = insertStmt.executeUpdate();
                    if (rowsInserted > 0) {
                        out.println("{\"status\": \"success\", \"message\": \"Registration successful. Please login.\"}");
                    } else {
                        out.println("{\"status\": \"error\", \"message\": \"Registration failed. Please try again.\"}");
                    }
                }
            }
        }
    }

    private void loginUser(HttpServletRequest request, HttpServletResponse response, PrintWriter out) throws Exception {
        String email = request.getParameter("login-email");
        String password = request.getParameter("login-password");
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        try (Connection conn = connect()) {
            String sql = "SELECT username, password FROM users WHERE email = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, email);

            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                String encryptedPassword = rs.getString("password");
                String decryptedPassword = EncryptionUtil.decrypt(encryptedPassword);

                if (decryptedPassword.equals(password)) {
                    String username = rs.getString("username"); 
                    out.println(String.format("{\"status\": \"success\", \"message\": \"Welcome %s\", \"email\": \"%s\", \"username\": \"%s\"}", username, email, username));

                } else {
                    out.println("{\"status\": \"error\", \"message\": \"Invalid password.\"}");
                }
            } else {
                out.println("{\"status\": \"error\", \"message\": \"Email not found. Please register first.\"}");
            }
        }
    }
}
