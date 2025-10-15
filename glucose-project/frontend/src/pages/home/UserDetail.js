import React, { useState } from "react";
import axios from "axios";
import { Button, Form, Card, Row, Col } from "react-bootstrap";

export default function UserDetail({ state, setState }) {
    const profile = state?.profile ?? {};
    const [editing, setEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setState(prev => ({
            ...prev,
            profile: { ...prev.profile, [name]: value }
        }));
    };

    const handleSave = () => {
        axios.put("http://localhost:8080/user/update", state.profile)
            .then(() => {
                alert("회원 정보가 수정되었습니다!");
                setEditing(false);
                setShowPassword(false);
            })
            .catch(err => alert("수정 실패: " + err));
    };

    const handleCancel = () => {
        setEditing(false);
        setShowPassword(false);
    };

    return (
        <div className="container mt-5" style={{ maxWidth: "750px" }}>
            <Card className="shadow-sm p-4">
                <h3 className="mb-4 text-center">내 정보 수정</h3>
                <Form>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>아이디</Form.Label>
                                <Form.Control type="text" value={profile.userId} disabled />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>이름</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="userName"
                                    value={profile.userName || ""}
                                    onChange={handleChange}
                                    disabled={!editing}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>비밀번호</Form.Label>
                                <Form.Control
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={profile.password || ""}
                                    onChange={handleChange}
                                    disabled={!editing}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>당뇨 관련 질병</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="userType"
                                    value={profile.userType || ""}
                                    onChange={handleChange}
                                    disabled={!editing}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>키 (cm)</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="height"
                                    value={profile.height || ""}
                                    onChange={handleChange}
                                    disabled={!editing}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>몸무게 (kg)</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="weight"
                                    value={profile.weight || ""}
                                    onChange={handleChange}
                                    disabled={!editing}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>나이</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="age"
                                    value={profile.age || ""}
                                    onChange={handleChange}
                                    disabled={!editing}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>성별</Form.Label>
                                <Form.Select
                                    name="gender"
                                    value={profile.gender || ""}
                                    onChange={handleChange}
                                    disabled={!editing}
                                >
                                    <option value="">선택</option>
                                    <option value="남">남</option>
                                    <option value="여">여</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-4">
                        <Form.Label>보호자 ID</Form.Label>
                        <Form.Control
                            type="text"
                            name="guardianUserId"
                            value={profile.guardianUserId || ""}
                            onChange={handleChange}
                            disabled={!editing}
                        />
                    </Form.Group>

                    {!editing ? (
                        <Button
                            variant="primary"
                            onClick={() => {
                                setEditing(true);
                                setShowPassword(true); // ✅ 수정할 때 비밀번호 표시
                            }}
                            style={{ width: "100%" }}
                        >
                            수정하기
                        </Button>
                    ) : (
                        <div style={{ display: "flex", gap: "10px" }}>
                            <Button
                                variant="success"
                                onClick={handleSave}
                                style={{ flex: 1 }}
                            >
                                저장
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={handleCancel}
                                style={{ flex: 1 }}
                            >
                                취소
                            </Button>
                        </div>
                    )}
                </Form>
            </Card>
        </div>
    );
}